import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';
import { Activity } from './entities/activity.entity.js';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity) private readonly repo: Repository<Activity>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const activity = await this.repo.findOneBy({ id });

    if (!activity) throw new NotFoundException(`Activity ${id} not found`);

    return activity;
  }

  create(createActivityDto: CreateActivityDto) {
    return this.repo.save(this.repo.create(createActivityDto));
  }

  async update(id: number, updateActivityDto: UpdateActivityDto) {
    const activity = await this.findOne(id);
    this.repo.merge(activity, updateActivityDto);
    
    return this.repo.save(activity);
  }

  async remove(id: number) {
    await this.repo.remove(await this.findOne(id));
  }
}
