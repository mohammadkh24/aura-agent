import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  Length,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'نام محصول',
    example: 'کفش ورزشی نایک',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  name: string;

  @ApiProperty({
    description: 'کد یکتای محصول',
    example: 'NK-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiPropertyOptional({
    description: 'توضیحات محصول',
    example: 'کفش مناسب استفاده روزمره و ورزشی',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'قیمت محصول',
    example: 4500000,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'تعداد موجودی محصول',
    example: 12,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;
}