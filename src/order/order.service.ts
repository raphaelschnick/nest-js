import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, User } from '../typeorm';
import { Repository } from 'typeorm';
import { OrderNotFoundException } from '../exception/order-not-found.exception';
import { CreateOrderDto } from './dto/CreateOrder.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getList(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: { products: true, user: true },
    });
  }
  async get(id: number): Promise<Order | OrderNotFoundException> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { products: true, user: true },
    });
    if (order && order.id) {
      return order;
    } else {
      throw new OrderNotFoundException();
    }
  }

  create(order: CreateOrderDto, user: User) {
    const o = new Order();
    o.user = user;
    o.createdAt = new Date();
    o.shippingDate = new Date();
    const newOrder = this.orderRepository.create(o);
    return this.orderRepository.save(newOrder);
  }
}
