
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GenerateResponseDto {
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
}
