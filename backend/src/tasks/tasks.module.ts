import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';
import { UploadModule } from '../upload/upload.module';
import { TasksController } from './tasks.controller';
import { Task, TaskSchema } from './task.schema';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    MailModule,
    UploadModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
