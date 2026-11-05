import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: 'سلام، شرایط ارسال سفارش چطوره؟',
    description: 'پیام مشتری برای Agent',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  message: string;

  @ApiProperty({
    example: '59145a65-4405-461d-af99-2050da091832',
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
