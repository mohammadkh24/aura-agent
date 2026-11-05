
import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { KnowledgeService } from './knowledge.service';

import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { FindKnowledgeDto } from './dto/find-knowledge.dto';

@ApiTags('Knowledge')
@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private readonly knowledgeService: KnowledgeService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'ثبت اطلاعات جدید',
    description: 'ثبت اطلاعات و محتوای موردنیاز Agent فروشگاه',
  })
  @ApiBody({
    type: CreateKnowledgeDto,
  })
  @ApiResponse({
    status: 201,
    description: 'اطلاعات با موفقیت ثبت شد.',
  })
  @ApiResponse({
    status: 400,
    description: 'اطلاعات ارسالی معتبر نیست.',
  })
  create(
    @Body() createKnowledgeDto: CreateKnowledgeDto,
  ) {
    return this.knowledgeService.create(createKnowledgeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'دریافت لیست اطلاعات',
    description: 'جست‌وجو، فیلتر و صفحه‌بندی اطلاعات فروشگاه',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست اطلاعات با موفقیت دریافت شد.',
  })
  findAll(
    @Query() query: FindKnowledgeDto,
  ) {
    return this.knowledgeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'دریافت اطلاعات با شناسه',
  })
  @ApiParam({
    name: 'id',
    description: 'شناسه UUID اطلاعات',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات موردنظر دریافت شد.',
  })
  @ApiResponse({
    status: 404,
    description: 'اطلاعات موردنظر پیدا نشد.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.knowledgeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'ویرایش اطلاعات',
  })
  @ApiParam({
    name: 'id',
    description: 'شناسه UUID اطلاعات',
  })
  @ApiBody({
    type: UpdateKnowledgeDto,
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات با موفقیت ویرایش شد.',
  })
  @ApiResponse({
    status: 404,
    description: 'اطلاعات موردنظر پیدا نشد.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateKnowledgeDto: UpdateKnowledgeDto,
  ) {
    return this.knowledgeService.update(
      id,
      updateKnowledgeDto,
    );
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'غیرفعال‌سازی اطلاعات',
  })
  @ApiParam({
    name: 'id',
    description: 'شناسه UUID اطلاعات',
  })
  @ApiResponse({
    status: 200,
    description: 'اطلاعات با موفقیت غیرفعال شد.',
  })
  @ApiResponse({
    status: 400,
    description: 'اطلاعات قبلاً غیرفعال شده است.',
  })
  @ApiResponse({
    status: 404,
    description: 'اطلاعات موردنظر پیدا نشد.',
  })
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.knowledgeService.deactivate(id);
  }
}
