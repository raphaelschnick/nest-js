import { dto, include, nested } from 'dto-mapper';
import { UserDto } from '../../user/dto/User.dto';
import { ProductDto } from '../../product/dto/Product.dto';

@dto()
export class CartDto {
  @include()
  @nested(() => UserDto, false)
  user: UserDto;

  @include()
  @nested(() => ProductDto, true)
  products: ProductDto[];
}
