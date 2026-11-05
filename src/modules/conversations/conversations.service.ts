import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

import { ConversationStatus } from './enums/conversation-status.enum';
import { MessageRole } from './enums/message-role.enum';

import { SendMessageDto } from './dto/send-message.dto';
import { conversationMessages } from 'src/common/enums/messages.enum';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    private readonly aiService: AiService,
  ) {}

  async sendMessage(dto: SendMessageDto) {
    let conversation: Conversation;

    // ادامه مکالمه یا ایجاد مکالمه جدید
    if (dto.conversationId) {
      conversation = await this.findOpenConversation(dto.conversationId);
    } else {
      conversation = this.conversationRepository.create();

      conversation = await this.conversationRepository.save(conversation);
    }

    // دریافت تاریخچه قبل از ذخیره پیام جدید
    const history = await this.messageRepository.find({
      where: {
        conversationId: conversation.id,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    // ذخیره پیام مشتری
    const customerMessage = await this.saveCustomerMessage(
      conversation.id,
      dto.message,
    );

    // ارسال پیام جدید به همراه تاریخچه به AURA
    const aiResponse = await this.aiService.generateResponse(
      dto.message,
      history.map((item) => ({
        role: item.role,
        content: item.content,
      })),
    );

    // ذخیره پاسخ AURA
    const assistantMessage = await this.saveAssistantMessage(
      conversation.id,
      aiResponse.content,
    );

    return {
      message: 'پیام با موفقیت ارسال شد.',
      data: {
        conversationId: conversation.id,
        customerMessage,
        assistantMessage,
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

  // ارسال پیام مشتری و ذخیره آن
  async saveCustomerMessage(conversationId: string, content: string) {
    const conversation = await this.findOpenConversation(conversationId);

    const message = this.messageRepository.create({
      role: MessageRole.CUSTOMER,
      content,
      conversationId: conversation.id,
    });

    const savedMessage = await this.messageRepository.save(message);

    return savedMessage;
  }

  // ذخیره پاسخ AURA
  async saveAssistantMessage(conversationId: string, content: string) {
    const conversation = await this.findOpenConversation(conversationId);

    const message = this.messageRepository.create({
      role: MessageRole.ASSISTANT,
      content,
      conversationId: conversation.id,
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
