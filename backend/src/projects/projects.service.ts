import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {}

  async create(dto: CreateProjectDto, userId: string) {
    return this.projectModel.create({ ...dto, owner: new Types.ObjectId(userId) });
  }

  async findAll(userId: string, page = 1, limit = 10, search = '', status = '') {
    const query: any = { owner: new Types.ObjectId(userId) };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.projectModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.projectModel.countDocuments(query),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    if (project.owner.toString() !== userId) throw new ForbiddenException();
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.findOne(id, userId);
    return this.projectModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.projectModel.findByIdAndDelete(id);
    return { message: 'Project deleted' };
  }
}
