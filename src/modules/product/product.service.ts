import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThan, FindOptionsWhere } from 'typeorm';

import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';

import { ProductsMessages } from '../../common/enums/messages.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const existingProduct = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException(ProductsMessages.SKU_ALREADY_EXISTS);
    }

    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    return {
      message: ProductsMessages.CREATED,
      data: savedProduct,
    };
  }

  async findAll(query: FindProductsDto) {
    const {
      search,
      page = 1,
      limit = 10,
      isActive,
      stockStatus = 'all',
    } = query;

    const baseFilter: FindOptionsWhere<Product> = {};

    if (isActive !== undefined) {
      baseFilter.isActive = isActive;
    }

    if (stockStatus === 'in_stock') {
      baseFilter.stock = MoreThan(0);
    }

    if (stockStatus === 'out_of_stock') {
      baseFilter.stock = 0;
    }

    const where: FindOptionsWhere<Product>[] = [];

    if (search?.trim()) {
      const searchTerm = search.trim();

      where.push(
        { ...baseFilter, name: ILike(`%${searchTerm}%`) },
        { ...baseFilter, sku: ILike(`%${searchTerm}%`) },
      );
    } else {
      where.push(baseFilter);
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      message: ProductsMessages.FETCHED,
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(ProductsMessages.NOT_FOUND);
    }

    return {
      data: product,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(ProductsMessages.NOT_FOUND);
    }

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });

      if (existingProduct) {
        throw new ConflictException(ProductsMessages.SKU_ALREADY_EXISTS);
      }
    }

    Object.assign(product, updateProductDto);

    const updatedProduct = await this.productRepository.save(product);

    return {
      message: ProductsMessages.UPDATED,
      data: updatedProduct,
    };
  }

  async deactivate(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(ProductsMessages.NOT_FOUND);
    }

    if (!product.isActive) {
      throw new ConflictException(ProductsMessages.ALREADY_DEACTIVATED);
    }

    product.isActive = false;

    await this.productRepository.save(product);

    return {
      message: ProductsMessages.DEACTIVATED,
    };
  }
}
