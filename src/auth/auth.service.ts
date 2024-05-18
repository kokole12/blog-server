import {
  HttpException,
  HttpStatus,
  Injectable,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  blockedList: string[] = [];
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    try {
      const verify = await bcrypt.compare(password, user.password);

      if (!verify) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: any) {
    if (!user || !user.email) {
      throw new HttpException(
        'Invalid user object or missing email property',
        HttpStatus.NOT_FOUND,
      );
    }
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    return { access_token: accessToken };
  }

  async logout(@Req() req: Request) {
    console.log(this.blockedList);
    const headers = req.headers['authorization'];
    if (!headers) {
      throw new HttpException('Unauthorised request', HttpStatus.UNAUTHORIZED);
    }
    const token = headers.split(' ')[1];

    if (!token) {
      throw new HttpException('Ivalid token', HttpStatus.BAD_REQUEST);
    }
    return this.blockedList.push(token);
  }
}
