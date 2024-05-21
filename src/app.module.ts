import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { SendSignUpEmail } from './users/email.consumer';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { Article } from './articles/entities/article.entity';
import { CommentsModule } from './comments/comments.module';
import { Comments } from './comments/entities/comments.entity';
import { MailService } from './mail-service/mail-service.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: 3306,
      username: process.env.DB_USERNAME || 'kokole',
      password: process.env.DB_PASSWORD || 'password123',
      database: 'blogdb',
      entities: [User, Article, Comments],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ArticlesModule,
    CommentsModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService, SendSignUpEmail, MailService],
})
export class AppModule {}
