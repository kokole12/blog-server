import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly userService: UsersService,
  ) {}
  create(createArticleDto: CreateArticleDto) {
    return this.articleRepository.save(createArticleDto);
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
