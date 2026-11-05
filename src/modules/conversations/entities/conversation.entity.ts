
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  import { ConversationStatus } from '../enums/conversation-status.enum';
import { entityName } from 'src/common/enums/entity-name.enum';
import { Message } from './message.entity';
  
  @Entity(entityName.Conversation)
  export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({
      type: 'enum',
      enum: ConversationStatus,
      default: ConversationStatus.OPEN,
    })
    status: ConversationStatus;
  
    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  