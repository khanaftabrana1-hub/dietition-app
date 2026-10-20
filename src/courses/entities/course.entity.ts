import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToMany, 
  CreateDateColumn 
} from 'typeorm';
import { Student } from '../../students/entities/student.entity.js';


@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Student, (student) => student.courses)
  students: Student[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}