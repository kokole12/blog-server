import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Article } from './entities/article.entity';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: './uploads/thumbnails',
        filename: (req, file, callback) => {
          const uniqSuff =
            Date.now() +
            '-' +
            Math.random().toFixed(9).toString().replace('.', '');
          const ext = extname(file.originalname);
          const filename = `${file.originalname}-${uniqSuff}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  create(
    @Body() createArticleDto: CreateArticleDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.articlesService.create(createArticleDto, req, file);
  }

  @Get('/')
  async index(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<Article>> {
    const options: IPaginationOptions = {
      limit,
      page,
    };
    return this.articlesService.paginate(options);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.articlesService.findOne(req, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.updateArticle(req, updateArticleDto, id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.articlesService.deleteArticle(req, id);
  }
}
