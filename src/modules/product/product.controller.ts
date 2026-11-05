import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiParam,
} from '@nestjs/swagger';

import { ProductsService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'ایجاد محصول جدید' })
  @ApiCreatedResponse({ description: 'محصول با موفقیت ایجاد شد.' })
  @ApiConflictResponse({ description: 'کد محصول تکراری است.' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت لیست محصولات' })
  @ApiOkResponse({ description: 'لیست محصولات دریافت شد.' })
  findAll(@Query() query: FindProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'دریافت جزئیات محصول' })
  @ApiParam({ name: 'id', description: 'شناسه محصول', format: 'uuid' })
  @ApiOkResponse({ description: 'اطلاعات محصول دریافت شد.' })
  @ApiNotFoundResponse({ description: 'محصول پیدا نشد.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ویرایش محصول' })
  @ApiParam({ name: 'id', description: 'شناسه محصول', format: 'uuid' })
  @ApiOkResponse({ description: 'محصول ویرایش شد.' })
  @ApiNotFoundResponse({ description: 'محصول پیدا نشد.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'غیرفعال‌سازی محصول' })
  @ApiParam({ name: 'id', description: 'شناسه محصول', format: 'uuid' })
  @ApiOkResponse({ description: 'محصول غیرفعال شد.' })
  @ApiNotFoundResponse({ description: 'محصول پیدا نشد.' })
  @ApiConflictResponse({ description: 'محصول قبلاً غیرفعال شده است.' })
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.deactivate(id);
  }
}