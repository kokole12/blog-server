import { UsersService } from './../users/users.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}
  async login(loginDto: LoginDto) {
    if (!loginDto.email) {
      throw new HttpException('Missing email', HttpStatus.BAD_REQUEST);
    }
    if (!loginDto.password) {
      throw new HttpException('Missing email', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const verify = await bcrypt.compare(loginDto.password, user.password);
    if (!verify) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    return `Login in successfully ${123} is your token`;
  }
}
