import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

describe('CourseController', () => {
  let controller: CourseController;
  const courseService = {
    getAllCourses: jest.fn(),
    getCourseById: jest.fn(),
    createCourse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [{ provide: CourseService, useValue: courseService }],
    }).compile();

    controller = module.get<CourseController>(CourseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates course requests to CourseService', () => {
    controller.getAllCourses();
    controller.getCourseById('101');
    controller.createCourse({ name: 'NestJS', code: 'CS301' });

    expect(courseService.getAllCourses).toHaveBeenCalled();
    expect(courseService.getCourseById).toHaveBeenCalledWith('101');
    expect(courseService.createCourse).toHaveBeenCalledWith('NestJS', 'CS301');
  });
});
