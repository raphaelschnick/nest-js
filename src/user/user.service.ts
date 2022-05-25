import { Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../exception/user-not-found.exception';

export type User = any;

@Injectable()
export class UserService {
  private readonly users: User[];

  constructor() {
    this.users = [
      {
        id: 1,
        username: 'john',
        password: 'changeme',
      },
      {
        id: 2,
        username: 'chris',
        password: 'secret',
      },
      {
        id: 3,
        username: 'maria',
        password: 'guess',
      },
    ];
  }

  async getList(): Promise<User[]> {
    return this.users;
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async getById(id: number): Promise<User | undefined> {
    const user = this.users.find((u) => u.id === id);
    if (user && user.id) {
      return user;
    } else {
      throw new UserNotFoundException();
    }
  }

  async create(username: string, password: string) {
    this.users.push({ username, password });
  }
}
