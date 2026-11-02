import { forwardRef, Module } from '@nestjs/common';
import { CourseModule } from '../course/course.module';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    CourseModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
