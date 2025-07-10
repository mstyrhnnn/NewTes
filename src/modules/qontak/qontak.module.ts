require('dotenv').config();

import { Module } from '@nestjs/common';
import { QontakService } from './qontak.service';

@Module({
  providers: [QontakService],
  exports: [QontakService],
})

export class QontakModule { }