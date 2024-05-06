import {
  // BeforeInsert,
  // BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  @Unique(['email'])
  email: string;

  @Column()
  password: string;

  // @BeforeInsert()
  // @BeforeUpdate()
  // async hashPassword() {
  //   if (this.password) {
  //     const saltRounds = 10;
  //     this.password = await bcrypt.hash(this.password, saltRounds);
  //   }
  // }
}
