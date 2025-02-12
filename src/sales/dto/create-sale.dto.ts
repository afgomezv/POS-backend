import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class CreateContentDto {
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsInt({ message: 'El producto no es válido' })
  productId: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsInt({ message: 'La cantidad no es válida' })
  quantity: number;

  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber({}, { message: 'El precio no es válido' })
  price: number;
}

export class CreateSaleDto {
  @IsNotEmpty({ message: 'El total es obligatorio' })
  @IsNumber({}, { message: 'La cantidad no es válida' })
  total: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'El contenido es obligatorio' })
  @ValidateNested()
  @Type(() => CreateContentDto)
  contents: CreateContentDto[];
}
