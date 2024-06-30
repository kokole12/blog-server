import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        username: '',
      };

      const createdUser = await service.create(createUserDto);

      expect(createdUser).toHaveProperty('id');
      expect(createdUser.email).toBe(createUserDto.email);
      expect(
        bcrypt.compareSync(createUserDto.password, createdUser.password),
      ).toBe(true);
    });

    it('should throw an error if email is already taken', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        email: 'existing@example.com',
      } as User);

      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password',
        username: '',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findUserById', () => {
    it('should find a user by id', async () => {
      const user = await service.findUserById(1);
      expect(user).toBeDefined();
    });

    it('should return undefined if user is not found', async () => {
      const user = await service.findUserById(999);
      expect(user).toBeUndefined();
    });
  });
});
