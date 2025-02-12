import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @IsString({ message: 'El nombre del producto debe ser un texto' })
  name: string;

  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio no es válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'La cantidad no es válida' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  stock: number;

  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsInt({ message: 'La categoría no es un número' })
  @Min(1, { message: 'La categoría no puede ser menor a 1' })
  categoryId: number;
}
