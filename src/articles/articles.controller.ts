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
  HttpException,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Article } from './entities/article.entity';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    @InjectRepository(Article) private readonly repository: Repository<Article>,
  ) {}

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
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: 'image/(jpeg|jpg|png|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
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

  @Get()
  @ApiOperation({ summary: 'Search items by fields' })
  @ApiQuery({
    name: 'fields',
    type: String,
    isArray: true,
    description: 'Fields to search by',
    required: false,
  })
  @ApiQuery({ name: 'search', type: String, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Successful search',
    type: [Article],
  })
  @ApiResponse({ status: 400, description: 'Invalid search term' })
  async search(
    @Query('fields') fields: string,
    @Query('search') search: string,
  ): Promise<{ items: Article[]; totalCount: number }> {
    if (!Array.isArray(fields) || typeof search !== 'string') {
      throw new HttpException(
        'Invalid query parameters',
        HttpStatus.BAD_REQUEST,
      );
    }

    const searchFields = fields.split(',') as Array<keyof Article>;

    return this.articlesService.search(searchFields, search);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.articlesService.findOne(req, id);
  }

  @Get('user/:id')
  @UseGuards(AuthGuard('jwt'))
  getUserArticles(@Param() id: number): Promise<Article[]> {
    return this.articlesService.getUserArticles(id);
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
