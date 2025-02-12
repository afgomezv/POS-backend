import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content, Sale } from './entities/sale.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Content, Product])],
  exports: [SalesService],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
