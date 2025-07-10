import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversModule } from './drivers/drivers.module';
import { CustomersModule } from './customers/customers.module';
import { typeormConfig } from 'src/config/database/typeorm';
import { FleetsModule } from './fleets/fleets.module';
import { RequestsModule } from './requests/requests.module';
import { DeviceTokensModule } from './device_tokens/device_token.module';
import { FirebaseModule } from './firebase/firebase.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StoragesModule } from './storages/storages.module';
import { OrdersModule } from './orders/orders.module';
import { LocationsModule } from './locations/locations.module';
import { InsurancesModule } from './insurances/insurances.module';
import { MailModule } from './mail/mail.module';
import { OwnersModule } from './owners/owners.module';
import { LedgersModule } from './ledgers/ledgers.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QontakModule } from './qontak/qontak.module';
import { DiscountModule } from './discount/discount.module';
import { TaskModule } from './task/task.module';
import { DriverReimburseModule } from './driver_reimburse/driver_reimburse.module';
import { PdfModule } from './pdfdriver/pdf.module';
import { DriverMitraModule } from './drivers_mitra/driver_mitra.module';
import { FleetMitraModule } from './fleets_mitra/fleet_mitra.module';
import { WaBlasModule } from './wa_blas/wa_blas.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => typeormConfig,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    UsersModule,
    AuthModule,
    DriversModule,
   // DriverReimburseModule,
    CustomersModule,
    FleetsModule,
    // RequestsModule,
    // DeviceTokensModule,
    // FirebaseModule,
    // NotificationsModule,
    // StoragesModule,
    // OrdersModule,
    // LocationsModule,
    // InsurancesModule,
    // MailModule,
    // QontakModule,
    // OwnersModule,
    // LedgersModule,
    // DiscountModule,
    // TaskModule,
    // PdfModule,
    // DriverMitraModule,
    // FleetMitraModule,
    // WaBlasModule
  ],
})
export class AppModule { }
