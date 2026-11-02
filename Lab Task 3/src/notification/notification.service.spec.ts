import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  const enrollmentService = {
    getEnrollments: jest.fn().mockReturnValue({
      message: 'All enrollments fetched',
      data: [],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: EnrollmentService, useValue: enrollmentService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sends notifications and checks enrollment status', () => {
    expect(service.sendNotification('John Doe', 'Welcome!')).toEqual({
      message: 'Notification sent successfully',
      student: 'John Doe',
      notification: 'Welcome!',
    });
    expect(service.checkEnrollmentAndNotify('John Doe', '101')).toEqual({
      message: 'Enrollment status checked',
      student: 'John Doe',
      courseId: '101',
      enrollments: { message: 'All enrollments fetched', data: [] },
    });
    expect(enrollmentService.getEnrollments).toHaveBeenCalled();
  });
});
