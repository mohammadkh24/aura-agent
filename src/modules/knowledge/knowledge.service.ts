import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';

import { Knowledge } from './entities/knowledge.entity';

import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { FindKnowledgeDto } from './dto/find-knowledge.dto';
import { KnowledgeMessages } from 'src/common/enums/messages.enum';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(Knowledge)
    private readonly knowledgeRepository: Repository<Knowledge>,
  ) {}

  async create(createKnowledgeDto: CreateKnowledgeDto) {
    const knowledge = this.knowledgeRepository.create(createKnowledgeDto);

    const savedKnowledge = await this.knowledgeRepository.save(knowledge);

    return {
      message: KnowledgeMessages.CREATED,
      data: savedKnowledge,
    };
  }

  async findAll(query: FindKnowledgeDto) {
    const { search, category, isActive, page, limit } = query;

    const filters: FindOptionsWhere<Knowledge> = {};

    if (category) {
      filters.category = category;
    }

    if (isActive !== undefined) {
      filters.isActive = isActive;
    }

    const where: FindOptionsWhere<Knowledge>[] = search
      ? [
          {
            ...filters,
            title: ILike(`%${search}%`),
          },
          {
            ...filters,
            content: ILike(`%${search}%`),
          },
        ]
      : [filters];

    const [knowledge, total] = await this.knowledgeRepository.findAndCount({
      where,
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      message: KnowledgeMessages.FETCHED,
      data: knowledge,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { id },
    });

    if (!knowledge) {
      throw new NotFoundException(KnowledgeMessages.NOT_FOUND);
    }

    return {
      data: knowledge,
    };
  }

  async update(id: string, updateKnowledgeDto: UpdateKnowledgeDto) {
    const knowledge = await this.findKnowledgeOrFail(id);

    Object.assign(knowledge, updateKnowledgeDto);

    const updatedKnowledge = await this.knowledgeRepository.save(knowledge);

    return {
      message: KnowledgeMessages.UPDATED,
      data: updatedKnowledge,
    };
  }

  async deactivate(id: string) {
    const knowledge = await this.findKnowledgeOrFail(id);

    if (!knowledge.isActive) {
      throw new BadRequestException(KnowledgeMessages.ALREADY_DEACTIVATED);
    }

    knowledge.isActive = false;

    const deactivatedKnowledge = await this.knowledgeRepository.save(knowledge);

    return {
      message: KnowledgeMessages.DEACTIVATED,
      data: deactivatedKnowledge,
    };
  }

  private async findKnowledgeOrFail(id: string): Promise<Knowledge> {
    const knowledge = await this.knowledgeRepository.findOne({
      where: { id },
    });

    if (!knowledge) {
      throw new NotFoundException(KnowledgeMessages.NOT_FOUND);
    }

    return knowledge;
  }
}
