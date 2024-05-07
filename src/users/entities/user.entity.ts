import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from 'src/articles/entities/article.entity'; // Adjust the path as needed

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];
}
