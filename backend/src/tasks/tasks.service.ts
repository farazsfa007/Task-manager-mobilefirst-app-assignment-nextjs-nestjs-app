import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument, TaskPriority, TaskStatus } from './task.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly mailService: MailService,
  ) {}

  async create(userId: string, userEmail: string, dto: CreateTaskDto, attachments: string[]) {
    const task = await this.taskModel.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      userId,
      attachments,
    });

    await this.mailService.sendTaskCreated(userEmail, task.title);
    return task;
  }

  async findAll(userId: string, query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);

    const filter: any = { userId };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;

    if (query.fromDate || query.toDate) {
      filter.dueDate = {};
      if (query.fromDate) filter.dueDate.$gte = new Date(query.fromDate);
      if (query.toDate) {
        const end = new Date(query.toDate);
        end.setHours(23, 59, 59, 999);
        filter.dueDate.$lte = end;
      }
    }

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.taskModel.countDocuments(filter),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const task = await this.taskModel.findOne({ _id: id, userId });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(
    userId: string,
    userEmail: string,
    id: string,
    dto: UpdateTaskDto,
    attachments: string[],
  ) {
    const task = await this.taskModel.findOne({ _id: id, userId });

    if (!task) throw new NotFoundException('Task not found');

    const wasDone = task.status === TaskStatus.DONE;

    Object.assign(task, dto);
    if (dto.dueDate) task.dueDate = new Date(dto.dueDate);

    if (attachments.length > 0) {
      task.attachments = [...task.attachments, ...attachments];
    }

    await task.save();

    if (!wasDone && task.status === TaskStatus.DONE) {
      await this.mailService.sendTaskDone(userEmail, task.title);
    }

    return task;
  }

  async remove(userId: string, id: string) {
    const result = await this.taskModel.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found');
    }

    return { message: 'Task deleted successfully' };
  }
}
