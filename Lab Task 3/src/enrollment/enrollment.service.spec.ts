import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from '../course/course.service';
import { NotificationService } from '../notification/notification.service';
import { EnrollmentService } from './enrollment.service';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  const courseService = {
    getCourseById: jest.fn().mockReturnValue({
      message: 'Course fetched',
      id: '101',
    }),
  };
  const notificationService = {
    sendNotification: jest.fn().mockReturnValue({
      message: 'Notification sent successfully',
      student: 'John Doe',
      notification: 'Successfully enrolled in course 101',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        { provide: CourseService, useValue: courseService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns enrollments and includes course and notification data', () => {
    expect(service.getEnrollments()).toEqual({
      message: 'All enrollments fetched',
      data: [],
    });
    expect(service.enrollStudent('John Doe', '101')).toEqual({
      message: 'Student enrolled successfully',
      student: 'John Doe',
      course: { message: 'Course fetched', id: '101' },
      notification: {
        message: 'Notification sent successfully',
        student: 'John Doe',
        notification: 'Successfully enrolled in course 101',
      },
    });
    expect(courseService.getCourseById).toHaveBeenCalledWith('101');
    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      'John Doe',
      'Successfully enrolled in course 101',
    );
  });
});
