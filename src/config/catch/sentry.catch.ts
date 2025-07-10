import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const { user } = host.switchToHttp().getRequest();

        if (exception instanceof HttpException) {
            if (exception.getStatus() >= 500 || exception.getStatus() == 409) {
                this.throwSentryException(user, exception);
            }
        } else {
            this.throwSentryException(user, exception);
        }
        super.catch(exception, host);
    }

    private throwSentryException(user, exception) {
        Sentry.withScope(function (scope) {
            if (user) {
                scope.setUser({
                    id: user.id,
                    email: user.email ?? user.phone_number,
                    ip_address: '{{auto}}',
                });
                scope.setTag('device_id', user.device_id);
            }

            Sentry.captureException(exception);
        });
    }
}
