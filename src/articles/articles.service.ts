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

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async create(
    createArticleDto: CreateArticleDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file);
    const headers = req.headers['authorization'];

    if (!headers) {
      throw new HttpException('Authorization failed', HttpStatus.BAD_REQUEST);
    }
    const token = headers.split(' ')[1];

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

      const userId: number = decodedToken['sub'];
      if (isNaN(userId)) {
        throw new HttpException(
          'Invalid user ID in token',
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log('User ID:', userId);

      createArticleDto.authorId = userId;

      if (file) {
        createArticleDto.thumbnail = file.filename;
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
