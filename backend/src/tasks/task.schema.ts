import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '', trim: true })
  description!: string;

  @Prop({ enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  @Prop({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Prop()
  dueDate?: Date;

  @Prop({ required: true, trim: true })
  location!: string;

  @Prop({ type: [String], default: [] })
  attachments!: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);