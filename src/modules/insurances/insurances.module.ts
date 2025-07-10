import { Module } from '@nestjs/common';
import { InsurancesService } from './insurances.service';
import { InsurancesController } from './insurances.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuranceEntity } from './entities/insurances.entity';

@Module({
  controllers: [InsurancesController],
  providers: [InsurancesService],
  imports: [
    TypeOrmModule.forFeature([
      InsuranceEntity,
    ]),
  ],
  exports: [InsurancesService],
})
export class InsurancesModule { }
