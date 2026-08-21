import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from '../upload/upload.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5))
  async create(
    @Req() req: Request,
    @Body() dto: CreateTaskDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const user = req.user as { userId: string; email: string };
    const attachments = await this.uploadService.uploadFiles(files || []);
    return this.tasksService.create(user.userId, user.email, dto, attachments);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: any) {
    const user = req.user as { userId: string };
    return this.tasksService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.tasksService.findOne(user.userId, id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 5))
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const user = req.user as { userId: string; email: string };
    const attachments = await this.uploadService.uploadFiles(files || []);
    return this.tasksService.update(
      user.userId,
      user.email,
      id,
      dto,
      attachments,
    );
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { userId: string };
    return this.tasksService.remove(user.userId, id);
  }
}
