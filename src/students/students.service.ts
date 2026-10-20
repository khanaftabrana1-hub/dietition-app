import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { Student } from './entities/student.entity.js';
import { Course } from '../courses/entities/course.entity.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) { }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const existing = await this.studentRepository.findOne({ where: { email: createStudentDto.email } });
    // Or use repository directly:
    const existingStudent = await this.studentRepository.findOne({
      where: { email: createStudentDto.email },
    });

    if (existingStudent) {
      throw new ConflictException('Email already exists');
    }

    const student = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: { courses: true },
    });
  }

  async findOne(id: string): Promise<any> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: { courses: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return {
      ...student,
      totalCourses: student.courses.length,
    };

  }

  async assignCourseToStudent(studentId: string, courseId: string): Promise<Student> {
    const student = await this.findOne(studentId);

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }



    const isAlreadyAssigned = student.courses.some((c: any) => c.id === courseId);
    if (isAlreadyAssigned) {
      throw new ConflictException('Course is already assigned to this student');
    }

    student.courses.push(course);
    return this.studentRepository.save(student);
  }
}