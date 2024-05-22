import { Article } from 'src/articles/entities/article.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async findArticleById(articleid): Promise<Article> {
    return this.articleRepository.findOneBy({ articleid });
  }

  async create(
    createArticleDto: CreateArticleDto,
    req: any,
    file: Express.Multer.File,
  ) {
    console.log('createArticleDto:', createArticleDto); // Debug log

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

      const article = this.articleRepository.create(createArticleDto);
      return await this.articleRepository.save(article);
    } catch (error) {
      console.error('Error decoding token:', error.message);
      throw new Error('Invalid token');
    }
  }

  async findOne(req: any, articleid: number): Promise<Article> {
    console.log(req.user);
    if (!req.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const article = await this.articleRepository.findOneBy({ articleid });

    if (!article) {
      throw new HttpException(
        `No post with id ${articleid}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return article;
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Article>> {
    const qb = this.articleRepository.createQueryBuilder('q');
    qb.orderBy('q.articleid', 'DESC');

    return paginate<Article>(qb, options);
  }

  async updateArticle(
    req: any,
    updateArticleDto: UpdateArticleDto,
    id: number,
  ): Promise<Article> {
    const userId = req.user.userId;
    try {
      const article = await this.findArticleById(id);

      if (!article) {
        throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
      }
      if (article.author.id !== userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      await this.articleRepository.update(id, updateArticleDto);
      return await this.findArticleById(id);
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteArticle(req: any, id: number) {
    const userId = req.user.userId;
    try {
      const article = await this.findArticleById(id);

      if (!article) {
        throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
      }
      if (article.author.id !== userId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      await this.articleRepository.delete(id);
      return await this.findArticleById(id);
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserArticles(userId): Promise<Article[]> {
    const userArticles = await this.articleRepository.find({
      where: { author: userId },
    });
    return userArticles;
  }
}
