import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  ParseUUIDPipe 
} from '@nestjs/common';
import { StudentsService } from './students.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { AssignCourseDto } from './dto/assign-course.dto.js';


@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.findOne(id);
  }

  @Post(':id/courses')
  assignCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignCourseDto: AssignCourseDto,
  ) {
    return this.studentsService.assignCourseToStudent(id, assignCourseDto.courseId);
  }
}