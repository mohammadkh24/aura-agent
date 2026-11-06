import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

import { ConversationStatus } from './enums/conversation-status.enum';
import { MessageRole } from './enums/message-role.enum';
import { MessageStatus } from './enums/message-status.enum';

import { SendMessageDto } from './dto/send-message.dto';
import { conversationMessages } from 'src/common/enums/messages.enum';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    private readonly aiService: AiService,
  ) {}

  // ارسال پیام مشتری و دریافت پاسخ AURA
  async sendMessage(dto: SendMessageDto) {
    let conversation: Conversation;

    if (dto.conversationId) {
      conversation = await this.findOpenConversation(dto.conversationId);
    } else {
      conversation = this.conversationRepository.create();
      conversation = await this.conversationRepository.save(conversation);
    }

    // فقط پیام‌های پردازش‌شده وارد تاریخچه AI می‌شوند
    const history = await this.messageRepository.find({
      where: {
        conversationId: conversation.id,
        status: MessageStatus.COMPLETED,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    // ابتدا پیام مشتری با وضعیت PENDING ذخیره می‌شود
    const customerMessage = await this.saveCustomerMessage(
      conversation.id,
      dto.message,
    );

    try {
      // ارسال پیام و تاریخچه به AURA
      const aiResponse = await this.aiService.generateResponse(
        dto.message,
        history.map((item) => ({
          role: item.role,
          content: item.content,
        })),
      );

      // ذخیره پاسخ دستیار
      const assistantMessage = await this.saveAssistantMessage(
        conversation.id,
        aiResponse.content,
      );

      // پردازش موفق؛ وضعیت پیام مشتری تغییر می‌کند
      customerMessage.status = MessageStatus.COMPLETED;

      const updatedCustomerMessage =
        await this.messageRepository.save(customerMessage);

      return {
        message: 'پیام با موفقیت ارسال شد.',
        data: {
          conversationId: conversation.id,
          customerMessage: updatedCustomerMessage,
          assistantMessage,
        },
      };
    } catch (error) {
      // در صورت شکست، پیام مشتری حذف نمی‌شود
      customerMessage.status = MessageStatus.FAILED;

      try {
        await this.messageRepository.save(customerMessage);
      } catch (saveError) {
        this.logger.error(
          `Failed to update message status. Message ID: ${customerMessage.id}`,
          saveError instanceof Error ? saveError.stack : undefined,
        );
      }

      this.logger.error(
        `Message processing failed. Conversation ID: ${conversation.id}`,
        error instanceof Error ? error.stack : undefined,
      );

      // خطای اصلی به لایه بالاتر منتقل می‌شود
      throw error;
    }
  }

  // فهرست مکالمات برای پنل مدیریت
  async findAll(page = 1, limit = 10, status?: ConversationStatus) {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

    const safeLimit =
      Number.isFinite(limit) && limit > 0
        ? Math.min(Math.floor(limit), 100)
        : 10;

    const query = this.conversationRepository
      .createQueryBuilder('conversation')
      .orderBy('conversation.updatedAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (status) {
      query.where('conversation.status = :status', { status });
    }

    const [conversations, total] = await query.getManyAndCount();

    const ids = conversations.map((item) => item.id);

    const latestMessages = ids.length
      ? await this.messageRepository.find({
          where: { conversationId: In(ids) },
          order: { createdAt: 'DESC' },
        })
      : [];

    const latestByConversation = new Map<string, Message>();

    for (const message of latestMessages) {
      if (!latestByConversation.has(message.conversationId)) {
        latestByConversation.set(message.conversationId, message);
      }
    }

    return {
      message: 'فهرست مکالمات دریافت شد.',
      data: conversations.map((conversation) => ({
        ...conversation,
        lastMessage: latestByConversation.get(conversation.id) ?? null,
      })),
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  // آمار داشبورد
  async getStats() {
    const [
      totalConversations,
      openConversations,
      closedConversations,
      totalMessages,
    ] = await Promise.all([
      this.conversationRepository.count(),
      this.conversationRepository.count({
        where: { status: ConversationStatus.OPEN },
      }),
      this.conversationRepository.count({
        where: { status: ConversationStatus.CLOSED },
      }),
      this.messageRepository.count(),
    ]);

    return {
      data: {
        totalConversations,
        openConversations,
        closedConversations,
        totalMessages,
      },
    };
  }

  // ایجاد مکالمه جدید
  async createConversation() {
    const conversation = this.conversationRepository.create();

    const savedConversation =
      await this.conversationRepository.save(conversation);

    return {
      message: conversationMessages.CREATED,
      data: savedConversation,
    };
  }

  // ذخیره پیام مشتری
  async saveCustomerMessage(conversationId: string, content: string) {
    const conversation = await this.findOpenConversation(conversationId);

    const message = this.messageRepository.create({
      role: MessageRole.CUSTOMER,
      content,
      conversationId: conversation.id,
      status: MessageStatus.PENDING,
    });

    return this.messageRepository.save(message);
  }

  // ذخیره پاسخ AURA
  async saveAssistantMessage(conversationId: string, content: string) {
    const conversation = await this.findOpenConversation(conversationId);

    const message = this.messageRepository.create({
      role: MessageRole.ASSISTANT,
      content,
      conversationId: conversation.id,
      status: MessageStatus.COMPLETED,
    });

    return this.messageRepository.save(message);
  }

  // دریافت تاریخچه مکالمه
  async getConversationHistory(conversationId: string) {
    await this.findConversation(conversationId);

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    return {
      message: conversationMessages.FETCHED,
      data: messages,
    };
  }

  // بستن مکالمه
  async closeConversation(conversationId: string) {
    const conversation = await this.findConversation(conversationId);

    if (conversation.status === ConversationStatus.CLOSED) {
      throw new BadRequestException(conversationMessages.ALREADY_CLOSED);
    }

    conversation.status = ConversationStatus.CLOSED;

    const savedConversation =
      await this.conversationRepository.save(conversation);

    return {
      message: conversationMessages.CLOSED,
      data: savedConversation,
    };
  }

  // پیدا کردن مکالمه
  private async findConversation(conversationId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(conversationMessages.NOT_FOUND);
    }

    return conversation;
  }

  // پیدا کردن مکالمه باز
  private async findOpenConversation(conversationId: string) {
    const conversation = await this.findConversation(conversationId);

    if (conversation.status === ConversationStatus.CLOSED) {
      throw new BadRequestException(conversationMessages.ALREADY_CLOSED);
    }

    return conversation;
  }
}
