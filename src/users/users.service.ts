import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
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
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectQueue(Email_Queue) private readonly emailQueue: Queue,
    private readonly mailerService: MailerService,
  ) {}

  async findUserById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
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

    const user = this.userRepository.create(createUserDto);
    await this.sendActivationEmail(user);

    return this.userRepository.save(user);
  }

  async sendActivationEmail(user: User): Promise<void> {
    const link = `http://localhost:3000/account/active/${user.activationToken}`;
    console.log(link); // Consider including this link in the email body
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Blog Server',
      template: './welcome',
      context: {
        activationLink: link,
      },
    });
  }

  async activateUser(activationToken: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        activationToken,
        activeExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new HttpException(
        'Activation token is invalid or has expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.active = true;
    user.activationToken = null;
    user.activeExpires = null;
    return this.userRepository.save(user);
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
