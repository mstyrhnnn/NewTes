import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('admin_comments')
export class AdminComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number; 

  @Column('text')
  message: string; 

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deleted_at: Date | null;

  @Column({ type: 'varchar', default: '' })
  related_upload_batch: string; 
}
