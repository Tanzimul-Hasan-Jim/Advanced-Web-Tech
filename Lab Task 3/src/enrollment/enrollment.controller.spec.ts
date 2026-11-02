import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';

describe('EnrollmentController', () => {
  let controller: EnrollmentController;
  const enrollmentService = {
    getEnrollments: jest.fn(),
    enrollStudent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentController],
      providers: [{ provide: EnrollmentService, useValue: enrollmentService }],
    }).compile();

    controller = module.get<EnrollmentController>(EnrollmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates enrollment requests to EnrollmentService', () => {
    controller.getEnrollments();
    controller.enrollStudent({ studentName: 'John Doe', courseId: '101' });

    expect(enrollmentService.getEnrollments).toHaveBeenCalled();
    expect(enrollmentService.enrollStudent).toHaveBeenCalledWith(
      'John Doe',
      '101',
    );
  });
});
