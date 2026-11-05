
import {
    Injectable,
    Logger,
    InternalServerErrorException,
    OnModuleInit,
  } from '@nestjs/common';
  
  import { ConfigService } from '@nestjs/config';
  import Groq from 'groq-sdk';
  
  @Injectable()
  export class GroqService implements OnModuleInit {
    private readonly logger = new Logger(GroqService.name);
  
    private groq: Groq;
    private model: string;
  
    constructor(
      private readonly configService: ConfigService,
    ) {}
  
    onModuleInit() {
      const apiKey = this.configService.get<string>(
        'ai.groqApiKey',
      );
  
      this.model = this.configService.get<string>(
        'ai.groqModel',
        'openai/gpt-oss-20b',
      );
  
      if (!apiKey) {
        throw new Error(
          'GROQ_API_KEY در فایل تنظیمات تعریف نشده است.',
        );
      }
  
      if (!this.model) {
        throw new Error(
          'GROQ_MODEL در فایل تنظیمات تعریف نشده است.',
        );
      }
  
      this.groq = new Groq({ apiKey });
  
      this.logger.log('اتصال به سرویس Groq آماده است.');
    }
  
    async generateCompletion(
      messages: Groq.Chat.ChatCompletionMessageParam[],
      tools?: Groq.Chat.ChatCompletionTool[],
    ) {
      try {
        const response = await this.groq.chat.completions.create({
          model: this.model,
          messages,
          temperature: 0.7,
          max_completion_tokens: 1024,
  
          ...(tools?.length
            ? {
                tools,
                tool_choice: 'auto' as const,
              }
            : {}),
        });
  
        const result = response.choices[0];
  
        return {
            content: result?.message?.content ?? '',
            message: result?.message,
            toolCalls: result?.message?.tool_calls ?? [],
            finishReason: result?.finish_reason,
            model: response.model,
            usage: response.usage,
          };
      } catch (error) {
        this.logger.error(
          'خطا در ارتباط با سرویس Groq',
          error instanceof Error
            ? error.stack
            : String(error),
        );
  
        throw new InternalServerErrorException(
          'در حال حاضر امکان دریافت پاسخ از سرویس هوش مصنوعی وجود ندارد.',
        );
      }
    }
  }
  