import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommentDto } from './dto/comment.dto';
import { Comments } from './entities/comments.entity';
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}
  @Post(':id/comment')
  @UseGuards(AuthGuard('jwt'))
  comment(
    @Req() req: any,
    @Param() id: number,
    commnentDto: CommentDto,
  ): Promise<Comments> {
    return this.commentService.comment(req, id, commnentDto);
  }

  @Get(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  comments(@Req() req: any, @Param() id: number): Promise<Comments[]> {
    return this.commentService.comments(req, id);
  }
}
