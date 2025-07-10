import { Module } from '@nestjs/common';
import { StoragesService } from './storages.service';
import { StoragesController } from './storages.controller';

@Module({
  providers: [StoragesService],
  exports: [StoragesService],
  controllers: [StoragesController]
})
export class StoragesModule {}
