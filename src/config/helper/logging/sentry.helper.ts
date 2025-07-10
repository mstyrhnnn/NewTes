import * as Sentry from '@sentry/node';

export class SentryHelper {

    static captureEvent(user, event: string, data: any) {
        Sentry.withScope(function (scope) {
            if (user) {
                scope.setUser({
                    id: user.id,
                    email: user.email ?? user.phone_number,
                    ip_address: '{{auto}}',
                });
                scope.setTag('device_id', user.device_id);
            }

            Sentry.captureEvent({
                message: event,
                extra: data,
            });
        });
    }
}