import * as dotenv from 'dotenv'

import { ForbiddenException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../users/users.service";

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        });
    }

    async validate(payload: any) {
        const user = await this.userService.findOne(payload.sub.user_id, true);

        if (!user || !user.status_login) {
            throw new ForbiddenException('User Tidak Ditemukan');
        }


        return {
            ...user,
            device_id: payload.sub.device_id,
        };
    }
}