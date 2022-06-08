import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from '../typeorm';
import { Repository } from 'typeorm';
import { UserNotFoundException } from '../exception/user-not-found.exception';

export type User = any;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getList(): Promise<User[]> {
    return this.userRepository.find();
  }

  async get(username: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ username });
  }

  async getById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOneBy({ id });
    if (user && user.id) {
      return user;
    } else {
      throw new UserNotFoundException();
    }
  }

  create(user: CreateUserDto) {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }
}
