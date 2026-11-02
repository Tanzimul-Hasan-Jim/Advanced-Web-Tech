import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  sendNotification(@Body() body: { studentName: string; message: string }) {
    return this.notificationService.sendNotification(
      body.studentName,
      body.message,
    );
  }

  @Post('check')
  checkEnrollmentAndNotify(
    @Body() body: { studentName: string; courseId: string },
  ) {
    return this.notificationService.checkEnrollmentAndNotify(
      body.studentName,
      body.courseId,
    );
  }
}
