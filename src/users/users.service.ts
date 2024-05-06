import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Email_Queue } from '../constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectQueue(Email_Queue) private readonly emailQueue: Queue,
  ) {}

  async findUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.findUserByEmail(createUserDto.email);
    if (user) {
      throw new HttpException('Email already taken', HttpStatus.BAD_REQUEST);
    }
    await this.sendEmail(createUserDto.email);
    return this.userRepository.save(createUserDto);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.userRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.userRepository.update(user.id, updateUserDto);
    return { ...user, ...updateUserDto };
  }

  async remove(id: number) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
    return this.userRepository.delete(id);
  }

  async sendEmail(email: string) {
    await this.emailQueue.add({
      email: email,
    });
  }
}
