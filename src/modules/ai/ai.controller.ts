
import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AiService } from './ai.service';
import { GenerateResponseDto } from './dto/generate-response.dto';
import { AiMessages } from '../../common/enums/messages.enum';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post('generate')
  @ApiOperation({
    summary: 'تولید پاسخ هوشمند',
    description: 'ارسال پیام مشتری و دریافت پاسخ از AURA',
  })
  @ApiBody({
    type: GenerateResponseDto,
  })
  @ApiResponse({
    status: 201,
    description: AiMessages.RESPONSE_GENERATED,
  })
  @ApiResponse({
    status: 400,
    description: 'پیام ارسالی معتبر نیست.',
  })
  @ApiResponse({
    status: 500,
    description: 'خطا در ارتباط با سرویس هوش مصنوعی.',
  })
  async generate(
    @Body() dto: GenerateResponseDto,
  ) {
    const response = await this.aiService.generateResponse(
      dto.message,
    );

    return {
      message: AiMessages.RESPONSE_GENERATED,
      data: response,
    };
  }
}
