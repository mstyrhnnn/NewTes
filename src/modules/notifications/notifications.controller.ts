import { Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { GetNotificationPaginationDto } from './dto/get-notifications-pagination.dto';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { RoleType } from 'src/config/auth/role/role.enum';

@Controller({
    version: '1',
    path: 'notifications',
})
@ApiTags('v1/notifications')
export class NotificationsController {

    constructor(private notificationService: NotificationsService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @RoleTypes(RoleType.DRIVER, RoleType.CUSTOMER)
    @ApiBearerAuth()
    async get(
        @Request() req,
        @Query() dto: GetNotificationPaginationDto,
    ) {
        return await this.notificationService.getNotification(req.user.id, new GetNotificationPaginationDto(dto));
    }

    @Get('unread/count')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @RoleTypes(RoleType.DRIVER, RoleType.CUSTOMER)
    @ApiBearerAuth()
    async getUnreadCount(
        @Request() req,
    ) {
        return await this.notificationService.getUnreadCount(req.user.id);
    }

    @Post(':id/view')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @RoleTypes(RoleType.DRIVER, RoleType.CUSTOMER)
    @ApiBearerAuth()
    async view(
        @Request() req,
        @Param('id') id: string,
    ) {
        return await this.notificationService.viewNotification(Number(id), req.user.id);
    }
}
