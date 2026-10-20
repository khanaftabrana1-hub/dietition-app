import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignCourseDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}