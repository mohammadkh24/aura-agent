
import { Module } from '@nestjs/common';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';

import { GroqService } from './services/groq.service';
import { AiToolsService } from './services/ai-tools.service';

import { KnowledgeModule } from '../knowledge/knowledge.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    ProductModule,
    KnowledgeModule,
  ],
  controllers: [AiController],
  providers: [
    AiService,
    GroqService,
    AiToolsService,
  ],
  exports: [
    AiService,
    GroqService,
  ],
})
export class AiModule {}
