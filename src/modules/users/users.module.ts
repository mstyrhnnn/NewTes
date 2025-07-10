import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserIdCards } from './entities/user-id-cards.entity';
import { MailModule } from '../mail/mail.module';
import { UserTokenEntity } from './entities/user-token.entity';
import { QontakModule } from '../qontak/qontak.module';
import { AdminComment } from './entities/admin-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserIdCards,
      UserTokenEntity,
      AdminComment
    ]),
    MailModule,
    QontakModule,
  ],
  providers: [
    UsersService,
  ],
  exports: [UsersService],
})
export class UsersModule { }
