import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;
  const notificationService = {
    sendNotification: jest.fn(),
    checkEnrollmentAndNotify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: notificationService }],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates notification requests to NotificationService', () => {
    controller.sendNotification({ studentName: 'John Doe', message: 'Welcome!' });
    controller.checkEnrollmentAndNotify({
      studentName: 'John Doe',
      courseId: '101',
    });

    expect(notificationService.sendNotification).toHaveBeenCalledWith(
      'John Doe',
      'Welcome!',
    );
    expect(
      notificationService.checkEnrollmentAndNotify,
    ).toHaveBeenCalledWith('John Doe', '101');
  });
});
