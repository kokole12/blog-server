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
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: './uploads/thumbnails',
        filename: (req, file, callback) => {
          const uniqSuff = Date.now() + '-' + Math.random() * 1e9;
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

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
  //   return this.articlesService.update(+id, updateArticleDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(+id);
  }
}
