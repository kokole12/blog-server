import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Article } from './../../articles/entities/article.entity';

@Entity()
export class Comments {
  @PrimaryGeneratedColumn()
  commentid: number;

  @Column({ nullable: true })
  comment?: string;

  @ManyToOne(() => Article, (article) => article.comments)
  article: Article;
}
