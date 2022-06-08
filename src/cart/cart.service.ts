import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, Product, User } from '../typeorm';
import { CartNotFoundException } from '../exception/cart-not-found.exception';
import { OrderService } from '../order/order.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly orderService: OrderService,
  ) {}

  async getByUser(user: User): Promise<Cart> {
    return this.cartRepository.findOne({
      where: { user },
      relations: { products: true, user: true },
    });
  }
  async get(id: number): Promise<Cart | undefined> {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: { products: true, user: true },
    });
    if (cart && cart.id) {
      return cart;
    } else {
      throw new CartNotFoundException();
    }
  }

  addToCart(cart: Cart, products: Product[]) {
    products.forEach(async (product) => {
      await this.cartRepository
        .createQueryBuilder()
        .relation(Cart, 'products')
        .of(product)
        .add(product);
    });
  }

  removeFromCart(cart: Cart, product: Product) {
    const products = cart.products;
    products.indexOf(product);
    // TODO: remove object
    return this.cartRepository.update(cart.id, { products: products });
  }

  async checkout(cart: Cart) {
    const user = cart.user;
    const products = cart.products;
    await this.create(user);
    return this.orderService.create(products, user);
  }

  create(user: User) {
    const newCart = this.cartRepository.create({ user });
    return this.cartRepository.save(newCart);
  }
}
