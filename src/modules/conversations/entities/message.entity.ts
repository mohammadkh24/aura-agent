import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

import { MessageRole } from '../enums/message-role.enum';
import { MessageStatus } from '../enums/message-status.enum';
import { Conversation } from './conversation.entity';
import { entityName } from 'src/common/enums/entity-name.enum';

@Entity(entityName.Message)
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MessageRole,
  })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.COMPLETED,
  })
  status: MessageStatus;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({ type: 'uuid' })
  conversationId: string;

  @CreateDateColumn()
  createdAt: Date;
}