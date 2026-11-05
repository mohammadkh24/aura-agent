import {
    IsOptional,
    IsString,
    IsInt,
    Min,
    IsBoolean,
    IsIn,
  } from 'class-validator';
  import { Type, Transform } from 'class-transformer';
  
  export class FindProductsDto {
    @IsOptional()
    @IsString()
    search?: string;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 10;
  
    @IsOptional()
    @Transform(({ value }) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    })
    @IsBoolean()
    isActive?: boolean;
  
    @IsOptional()
    @IsIn(['all', 'in_stock', 'out_of_stock'])
    stockStatus: 'all' | 'in_stock' | 'out_of_stock' = 'all';
  }