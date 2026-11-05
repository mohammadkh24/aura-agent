import { entityName } from 'src/common/enums/entity-name.enum';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
  } from 'typeorm';
  
  @Entity(entityName.Product)
  @Index(['name'])
  @Index(['sku'], { unique: true })
  export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 150 })
    name: string;
  
    @Column({ unique: true, length: 50 })
    sku: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    price: number;
  
    @Column({ type: 'int', default: 0 })
    stock: number;
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }