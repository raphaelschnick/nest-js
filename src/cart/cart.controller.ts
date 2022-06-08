import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { buildMapper } from 'dto-mapper';
import { CartDto } from './dto/Cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { ProductDto } from '../product/dto/Product.dto';
import { ProductService } from '../product/product.service';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  private readonly mapper = buildMapper(CartDto);
  private readonly productMapper = buildMapper(ProductDto);

  @UseGuards(JwtAuthGuard)
  @Get()
  async getList(@Request() req): Promise<CartDto> {
    const user = await this.userService.get(req.user.username);
    const cart = await this.cartService.getByUser(user);
    if (cart && cart.id) {
      return cart;
    } else {
      console.log('create cart');
      return this.cartService.create(user);
    }
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const cart = await this.cartService.get(id);
    return this.mapper.serialize(cart);
  }

  @Get(':id/products')
  async getProducts(@Param('id', ParseIntPipe) id: number) {
    const cart = await this.cartService.get(id);
    return this.productMapper.serialize(cart.products);
  }

  @Put(':id/products')
  async addProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() products: number[],
  ) {
    if (products?.length >= 1) {
      const cart = await this.cartService.get(id);
      const productList = [];
      products.forEach((productId) => {
        this.productService.get(productId).then((product) => {
          productList.push(product);
        });
      });
      const updatedCart = await this.cartService.addToCart(cart, productList);
      console.log(updatedCart);
      return this.mapper.serialize(updatedCart);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'No Products selected!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Post(':id/checkout')
  async checkout(@Request() request, @Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.get(request.user.username);
    const cart = await this.cartService.get(id);
    if (cart?.products?.length !== 0) {
      if (cart?.user.id === user.id) {
        return this.cartService.checkout(cart);
      } else {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            message: 'You are not allowed to checkout this cart!',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'No Products in Cart!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
