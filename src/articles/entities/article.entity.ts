import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ type: 'blob', nullable: true })
  thumbnail: Buffer;

  @ManyToOne(() => User, (user) => user.articles)
  author: User;

  @Column('simple-array')
  comments: string[];

  @Column()
  likes: number;

  @Column()
  link: string;

  @Column()
  slug: string;

  @Column('simple-array')
  tags: string[];
}
