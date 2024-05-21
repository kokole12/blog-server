import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ArticlesService } from 'src/articles/articles.service';
import { Comments } from './entities/comments.entity';
import { CommentDto } from './dto/comment.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentsService {
  constructor(
    private readonly articleService: ArticlesService,
    @InjectRepository(Comments) private commentRepository: Repository<Comments>,
  ) {}

  async comment(
    req: any,
    id: number,
    commentDto: CommentDto,
  ): Promise<Comments> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const article = await this.articleService.findArticleById(id);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = this.commentRepository.create({
      ...commentDto,
      article,
    });

    return this.commentRepository.save(comment);
  }

  async comments(req: any, id: number): Promise<Comments[]> {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const article = await this.articleService.findArticleById(id);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.article', 'article')
      .where('article.id = :id', { id })
      .getMany();
  }
}
