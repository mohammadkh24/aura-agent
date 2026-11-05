import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { ConversationsService } from './conversations.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationStatus } from './enums/conversation-status.enum';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'آمار مکالمات برای داشبورد مدیریت' })
  getStats() {
    return this.conversationsService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'دریافت فهرست مکالمات' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ConversationStatus,
  ) {
    return this.conversationsService.findAll(
      Number(page ?? 1),
      Number(limit ?? 10),
      status,
    );
  }

  @Post()
  @ApiOperation({ summary: 'ایجاد مکالمه جدید' })
  createConversation() {
    return this.conversationsService.createConversation();
  }

  @Post('messages')
  @ApiOperation({ summary: 'ارسال پیام و دریافت پاسخ AURA' })
  sendMessage(@Body() dto: SendMessageDto) {
    return this.conversationsService.sendMessage(dto);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'دریافت تاریخچه مکالمه' })
  @ApiParam({ name: 'id', description: 'شناسه مکالمه' })
  getConversationHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.conversationsService.getConversationHistory(id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'بستن مکالمه' })
  @ApiParam({ name: 'id', description: 'شناسه مکالمه' })
  closeConversation(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.conversationsService.closeConversation(id);
  }
}
