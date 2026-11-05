
import {
    Injectable,
    BadRequestException,
  } from '@nestjs/common';
  
  import { KnowledgeService } from '../../knowledge/knowledge.service';
  
  import { FindKnowledgeDto } from '../../knowledge/dto/find-knowledge.dto';
import { ProductsService } from 'src/modules/product/product.service';
import { FindProductsDto } from 'src/modules/product/dto/find-products.dto';
  
  @Injectable()
  export class AiToolsService {
    constructor(
      private readonly productsService: ProductsService,
      private readonly knowledgeService: KnowledgeService,
    ) {}
  
    async executeTool(name: string, argumentsString: string) {
      let args: { query?: string };
  
      try {
        args = JSON.parse(argumentsString);
      } catch {
        throw new BadRequestException(
          'ورودی ابزار هوش مصنوعی معتبر نیست.',
        );
      }
  
      const query = args.query?.trim();
  
      if (!query) {
        throw new BadRequestException(
          'عبارت جست‌وجو نمی‌تواند خالی باشد.',
        );
      }
  
      switch (name) {
        case 'search_products':
          return this.searchProducts(query);
  
        case 'search_knowledge':
          return this.searchKnowledge(query);
  
        default:
          throw new BadRequestException(
            `ابزار ${name} پشتیبانی نمی‌شود.`,
          );
      }
    }
  
    private async searchProducts(query: string) {
        const filters: FindProductsDto = {
          page: 1,
          limit: 10,
          isActive: true,
          stockStatus: 'all',
        };
      
        if (query.toLowerCase() !== 'all') {
          filters.search = query;
        }
      
        const result = await this.productsService.findAll(filters);
      
        return result.data.map((product) => ({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          sku: product.sku,
        }));
      }
  
    private async searchKnowledge(query: string) {
      const filters: FindKnowledgeDto = {
        search: query,
        page: 1,
        limit: 5,
        isActive: true,
      };
  
      const result = await this.knowledgeService.findAll(filters);
  
      return result.data.map((item) => ({
        title: item.title,
        category: item.category,
        content: item.content,
      }));
    }
  }
  