import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content, Sale } from './entities/sale.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Product } from '../products/entities/product.entity';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Content, Product]), CouponsModule],
  exports: [SalesService],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
