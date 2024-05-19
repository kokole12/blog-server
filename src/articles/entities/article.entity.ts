import slugify from 'slugify';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.articles)
  author: User;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ unique: true })
  slug?: string;

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.title, { lower: true }) + '-' + Date.now();
  }
}
