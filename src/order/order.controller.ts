import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { buildMapper } from 'dto-mapper';
import { OrderDto } from './dto/Order.dto';
import { CreateOrderDto } from './dto/CreateOrder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly userService: UserService,
  ) {}

  private readonly mapper = buildMapper(OrderDto);

  @Get()
  async getList(): Promise<OrderDto[]> {
    const orders = [];
    const list = await this.orderService.getList();
    list.forEach((order) => {
      orders.push(this.mapper.serialize(order));
    });
    return orders;
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const order = await this.orderService.get(id);
    return this.mapper.serialize(order);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Post()
  create(@Request() request, @Body() order: CreateOrderDto) {
    this.userService
      .get(request.user.username)
      .then((user) => {
        return this.orderService.create(order, user);
      })
      .catch((reason) => {
        console.error(reason);
      });
  }
}
