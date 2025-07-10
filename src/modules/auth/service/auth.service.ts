import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthLoginDto } from '../dto/auth-login.dto';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { TokenService } from './token.service';
import { AuthGetDto } from '../dto/auth-get.dto';
import { DeviceTokensService } from 'src/modules/device_tokens/device_token.service';
import { AuthRegisterDto } from '../dto/auth-register.dto';
import { UserIdCards } from 'src/modules/users/entities/user-id-cards.entity';
import { UserRoleEnum } from 'src/modules/users/enums/user.role.enum';
import { AuthForgotPasswordDto } from '../dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from '../dto/auth-reset-password.dto';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private tokenService: TokenService,
        private fcmTokenService: DeviceTokensService,
    ) { }

    async get(user, dto: AuthGetDto) {
        const token = await this.tokenService.signJwtToken(user.id.toString(), user.device_id?.toString());

        await this.insertToken(user.id, dto.token);

        return {
            user: user,
            token: token,
        }
    }

    async insertToken(id: number, token?: string) {
        if (token) {
            return await this.fcmTokenService.upsert(id, token);
        }

        return null;
    }

    async login(dto: AuthLoginDto, role?: UserRoleEnum | UserRoleEnum[]) {
        const validatedUser = await this.usersService.validateUser(dto.email, dto.password, role);

        if (!validatedUser.status_login) {
            throw new UnauthorizedException('Akun Tidak Ditemukan.');
        }

        const deviceToken = await this.insertToken(validatedUser.id, dto.token);

        const token = await this.tokenService.signJwtToken(validatedUser.id.toString(), deviceToken?.id?.toString());

        return {
            message: 'User logged in successfully',
            data: {
                user: validatedUser,
                token: token,
            },
        };
    }


    async register(dto: AuthRegisterDto) {
        const existingUser = await this.usersService.findByEmail(dto.email);

        if (existingUser && existingUser.status_login) {
            throw new BadRequestException('Email sudah digunakan...');
        }

        const user = await this.usersService.create(new UserEntity({
            ...dto,
            id_cards: dto.id_cards.map(idCard => new UserIdCards({ photo: idCard })),
            role: UserRoleEnum.CUSTOMER,
        }));

        const deviceToken = await this.insertToken(user.id, dto.token);

        const token = await this.tokenService.signJwtToken(user.id.toString(), deviceToken?.id?.toString());

        return {
            message: 'User registered successfully',
            data: {
                user: user,
                token: token,
            },
        };
    }


    async logout(deviceId?: number) {
        if (deviceId) {
            await this.fcmTokenService.remove(deviceId);
        }
    }

    async forgotPassword(dto: AuthForgotPasswordDto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user || !user.status_login) {
            throw new NotFoundException('Akun Tidak Ditemukan');
        }
        return await this.usersService.forgotPassword(dto.email);
    }

    async resetPassword(dto: AuthResetPasswordDto) {
        return await this.usersService.changePassword(dto.token, dto.password);
    }
}
