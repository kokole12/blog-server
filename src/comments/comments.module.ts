import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { ArticlesModule } from 'src/articles/articles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from './entities/comments.entity';
import { Article } from 'src/articles/entities/article.entity';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [ArticlesModule, TypeOrmModule.forFeature([Comments, Article])],
})
export class CommentsModule {}
