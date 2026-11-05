
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateKnowledgeDto {
  @ApiProperty({
    example: 'شرایط ارسال سفارش',
    description: 'عنوان اطلاعات',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  title: string;

  @ApiProperty({
    example: 'سفارش‌ها در روزهای کاری طی ۲۴ تا ۴۸ ساعت ارسال می‌شوند.',
    description: 'محتوای کامل اطلاعات',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 'shipping',
    description: 'دسته‌بندی اطلاعات',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;
}
