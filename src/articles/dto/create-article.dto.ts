import { IsNotEmpty, IsString, IsArray, IsNumber } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  thumbnail: Buffer;

  @IsNumber()
  authorId: number;

  @IsArray()
  comments: string[];

  @IsArray()
  likes: number;

  @IsString()
  link: string;

  @IsString()
  slug: string;

  @IsArray()
  tags: string[];
}
