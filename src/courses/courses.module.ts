import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { Student } from '../students/entities/student.entity.js';
import { Course } from './entities/course.entity.js';


@Module({
  imports: [TypeOrmModule.forFeature([Course, Student])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}