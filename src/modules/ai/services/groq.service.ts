import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
  GatewayTimeoutException,
  InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService implements OnModuleInit {
  private readonly logger = new Logger(GroqService.name);

  private groq!: Groq;
  private model!: string;

  private readonly timeout = 30_000;
  private readonly maxRetries = 2;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('ai.groqApiKey');

    this.model = this.configService.get<string>(
      'ai.groqModel',
      'openai/gpt-oss-20b',
    )!;

    if (!apiKey) {
      throw new Error('GROQ_API_KEY در تنظیمات تعریف نشده است.');
    }

    if (!this.model) {
      throw new Error('GROQ_MODEL در تنظیمات تعریف نشده است.');
    }

    this.groq = new Groq({
      apiKey,
      timeout: this.timeout,
      maxRetries: 0,
    });

    this.logger.log('اتصال به سرویس Groq آماده است.');
  }

  async generateCompletion(
    messages: Groq.Chat.ChatCompletionMessageParam[],
    tools?: Groq.Chat.ChatCompletionTool[],
  ) {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
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

        if (!result?.message) {
          throw new InternalServerErrorException(
            'پاسخ معتبری از سرویس هوش مصنوعی دریافت نشد.',
          );
        }

        return {
          content: result.message.content ?? '',
          message: result.message,
          toolCalls: result.message.tool_calls ?? [],
          finishReason: result.finish_reason,
          model: response.model,
          usage: response.usage,
        };
      } catch (error) {
        if (error instanceof InternalServerErrorException) {
          throw error;
        }

        const status = this.getErrorStatus(error);
        const retryable =
          status === undefined || status === 429 || status >= 500;

        const hasRetriesLeft = attempt < this.maxRetries;

        this.logger.error(
          `Groq request failed. Attempt: ${attempt + 1}, Status: ${status ?? 'Network/Unknown'}`,
        );

        if (retryable && hasRetriesLeft) {
          const delay = 1000 * Math.pow(2, attempt);

          this.logger.warn(`Retrying Groq request in ${delay}ms...`);

          await this.sleep(delay);
          continue;
        }

        if (this.isTimeoutError(error)) {
          throw new GatewayTimeoutException(
            'زمان دریافت پاسخ از سرویس هوش مصنوعی به پایان رسید.',
          );
        }

        if (status === 429 || (status !== undefined && status >= 500)) {
          throw new ServiceUnavailableException(
            'سرویس هوش مصنوعی موقتاً در دسترس نیست.',
          );
        }

        throw new ServiceUnavailableException(
          'در ارتباط با سرویس هوش مصنوعی مشکلی رخ داد.',
        );
      }
    }

    throw new ServiceUnavailableException(
      'امکان دریافت پاسخ از سرویس هوش مصنوعی وجود ندارد.',
    );
  }

  private getErrorStatus(error: unknown): number | undefined {
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof error.status === 'number'
    ) {
      return error.status;
    }

    return undefined;
  }

  private isTimeoutError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return (
      error.name.toLowerCase().includes('timeout') ||
      error.message.toLowerCase().includes('timed out')
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
