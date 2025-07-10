import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { DiscountService } from './discount.service';
import { DiscountController } from './discount.controller';
import { DiscountEntity } from './entities/discount.entity';
import { LocationEntity } from '../locations/entities/location.entity';
import { FleetsEntity } from '../fleets/entities/fleet.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DiscountEntity,
            LocationEntity,
            FleetsEntity
        ]),
        UsersModule,
    ],
    controllers: [DiscountController],
    providers: [
        DiscountService
    ],
    exports: [
        DiscountService,
    ]
})
export class DiscountModule { }
