import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(dto: CreateTaskDto, userId: string) {
    return this.taskModel.create({
      ...dto,
      project: new Types.ObjectId(dto.project),
      owner: new Types.ObjectId(userId),
    });
  }

  async findByProject(projectId: string, userId: string, status = '') {
    const query: any = {
      project: new Types.ObjectId(projectId),
      owner: new Types.ObjectId(userId),
    };
    if (status) query.status = status;
    return this.taskModel.find(query).sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string) {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    if (task.owner.toString() !== userId) throw new ForbiddenException();
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    await this.findOne(id, userId);
    return this.taskModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.taskModel.findByIdAndDelete(id);
    return { message: 'Task deleted' };
  }

  async removeByProject(projectId: string) {
    await this.taskModel.deleteMany({ project: new Types.ObjectId(projectId) });
  }
}
