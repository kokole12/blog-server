import { Comments } from './../../comments/entities/comments.entity';
import slugify from 'slugify';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
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

  @ManyToOne(() => User, (user) => user.articles, { eager: true })
  author: User;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => Comments, (comments) => comments.article)
  comments: Comments[];

  @BeforeInsert()
  generateSlug() {
    console.log('Generating slug for:', this);
    if (this.title) {
      this.slug = slugify(this.title, { lower: true }) + '-' + Date.now();
      console.log('Generated slug:', this.slug);
    } else {
      console.error('Title is undefined:', this);
    }
  }
}
