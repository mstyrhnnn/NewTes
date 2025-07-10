import { Module } from '@nestjs/common';
import { LedgersService } from './ledgers.service';
import { LedgersController } from './ledgers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgersEntity } from './entities/ledger.entity';
import { LedgerCategoriesEntity } from './entities/ledger-categories.entity';
import { FleetsEntity } from '../fleets/entities/fleet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LedgersEntity,
      LedgerCategoriesEntity,
      FleetsEntity
    ]),
  ],
  controllers: [LedgersController],
  providers: [LedgersService],
  exports: [LedgersService],
})
export class LedgersModule { }
