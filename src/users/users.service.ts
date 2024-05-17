import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Email_Queue } from '../constants';
import * as bcrypt from 'bcrypt';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectQueue(Email_Queue) private readonly emailQueue: Queue,
  ) {}

  async findUserById(id): Promise<User | undefined> {
    return await this.userRepository.findOne(id);
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.findUserByEmail(createUserDto.email);
    if (userExists) {
      throw new HttpException('Email already taken', HttpStatus.BAD_REQUEST);
    }
    const saltRounds = 10;
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );
    await this.sendEmail(createUserDto.email);
    return this.userRepository.save(createUserDto);
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map((users: User[]) => {
        users.forEach((user) => delete user.password);
        return users;
      }),
    );
  }

  async findOne(id: number): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.userRepository.update(user.id, updateUserDto);
    return this.findUserById(id); // Return updated user
  }

  async remove(id: number): Promise<void> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
    await this.userRepository.delete(id);
  }

  async sendEmail(email: string): Promise<void> {
    await this.emailQueue.add({ email });
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<User>> {
    const qb = this.userRepository.createQueryBuilder('q');
    qb.orderBy('q.id', 'DESC');

    return paginate<User>(qb, options);
  }
}
