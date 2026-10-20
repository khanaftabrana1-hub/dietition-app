import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity.js';
import { CreateCourseDto } from './dto/create-course.dto.js';


@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const existingCourse = await this.courseRepository.findOne({
      where: { code: createCourseDto.code },
    });

    if (existingCourse) {
      throw new ConflictException(`Course with code '${createCourseDto.code}' already exists`);
    }

    const course = this.courseRepository.create(createCourseDto);
    return this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
     relations: { students: true },
    });
  }

  async findOne(id: string): Promise<any> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: { students: true },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return {
      ...course,
      totalStudents: course.students.length,
    };
  }
  }
