import { Article } from 'src/articles/entities/article.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as crypto from 'crypto';

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
  articles?: Article[];

  @Column({ default: false })
  active: boolean;

  @Column()
  activationToken?: string;

  @Column()
  activeExpires?: Date;

  @BeforeInsert()
  generateActivationToken() {
    if (!this.activationToken) {
      const buf = crypto.randomBytes(20);
      this.activationToken = this.id + buf.toString('hex');
      this.activeExpires = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours from now
    }
  }
}
