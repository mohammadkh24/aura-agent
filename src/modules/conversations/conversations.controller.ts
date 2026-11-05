import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { ConversationsService } from './conversations.service';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
  ) {}

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
