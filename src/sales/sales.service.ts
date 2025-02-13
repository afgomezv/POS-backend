import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Content, Sale } from './entities/sale.entity';
import { Product } from '../products/entities/product.entity';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,

    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly couponService: CouponsService,
  ) {}

  async create(createSaleDto: CreateSaleDto) {
    await this.productRepository.manager.transaction(
      async (saleEntityManager) => {
        const sale = new Sale();

        const total = createSaleDto.contents.reduce(
          (total, item) => total + item.quantity * item.price,
          0,
        );
        sale.total = total;

        if (createSaleDto.coupon) {
          const coupon = await this.couponService.applyCoupon(
            createSaleDto.coupon,
          );

          const disccount = (coupon.percentage / 100) * total;
          sale.discount = disccount;
          sale.coupon = coupon.name;
          sale.total -= disccount;
        }

        for (const contents of createSaleDto.contents) {
          const product = await saleEntityManager.findOneBy(Product, {
            id: contents.productId,
          });

          const errors = [];

          if (!product) {
            errors.push(`El producto con ID ${contents.productId} no existe.`);
            throw new NotFoundException(errors);
          }

          if (contents.quantity > product.stock) {
            errors.push(
              `El producto ${product.name} no tiene stock suficiente`,
            );
            throw new BadRequestException(errors);
          }
          product.stock -= contents.quantity;

          // Create a content instance
          const content = new Content();
          content.price = contents.price;
          content.product = product;
          content.quantity = contents.quantity;
          content.sale = sale;

          await saleEntityManager.save(sale);
          await saleEntityManager.save(content);
        }
      },
    );

    return { message: 'La venta se guardo correctamente!' };
  }

  findAll(saleDate?: string) {
    const options: FindManyOptions<Sale> = {
      relations: {
        sales: true,
      },
    };

    if (saleDate) {
      const date = parseISO(saleDate);
      if (!isValid(date)) {
        throw new BadRequestException('La fecha no es válida');
      }

      const start = startOfDay(date);
      const end = endOfDay(date);

      options.where = {
        saleDate: Between(start, end),
      };
    }

    return this.saleRepository.find(options);
  }

  async findOne(id: number) {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: {
        sales: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('La venta no existe');
    }

    return sale;
  }

  // update(id: number, updateSaleDto: UpdateSaleDto) {
  //   return `This action updates a #${id} sale`;
  // }

  async remove(id: number) {
    const sale = await this.findOne(id);

    for (const sales of sale.sales) {
      const product = await this.productRepository.findOneBy({
        id: sales.product.id,
      });
      product.stock += sales.quantity;
      await this.productRepository.save(product);

      const contents = await this.contentRepository.findOneBy({ id: sales.id });
      await this.contentRepository.remove(contents);
    }

    await this.saleRepository.remove(sale);
    return { message: 'La venta se elimina correctamente' };
  }
}
