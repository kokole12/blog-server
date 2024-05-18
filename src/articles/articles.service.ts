import {
  HttpException,
  HttpStatus,
  Injectable,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}
  async create(
    createArticleDto: CreateArticleDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const headers = req.headers['authorization'];

    if (!headers) {
      throw new HttpException('Authorization failed', HttpStatus.BAD_REQUEST);
    }
    const token = headers.split(' ')[1];
    const isBlocked = this.authService.blockedList.some(
      (blockedToken) => blockedToken === token,
    );

    if (isBlocked) {
      throw new HttpException('expired session', HttpStatus.UNAUTHORIZED);
    }

    if (!token) {
      throw new HttpException('Authorization failed', HttpStatus.BAD_REQUEST);
    }
    try {
      const decodedToken = this.jwtService.decode(token);

      if (
        !decodedToken ||
        typeof decodedToken !== 'object' ||
        !('sub' in decodedToken)
      ) {
        throw new Error('Invalid token');
      }

      const userId = decodedToken['sub'];
      if (isNaN(userId)) {
        throw new HttpException(
          'Invalid user ID in token',
          HttpStatus.BAD_REQUEST,
        );
      }
      createArticleDto.author = userId;

      if (file) {
        createArticleDto.thumbnail = file.path;
      }

      return await this.articleRepository.save(createArticleDto);
    } catch (error) {
      console.error('Error decoding token:', error.message);
      throw new Error('Invalid token');
    }
  }

  findAll() {
    return this.articleRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }
  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
