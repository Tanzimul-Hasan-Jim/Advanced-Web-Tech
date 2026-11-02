import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let service: CourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseService],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the requested course data', () => {
    expect(service.getAllCourses()).toEqual({
      message: 'All courses fetched',
      data: [],
    });
    expect(service.getCourseById('101')).toEqual({
      message: 'Course fetched',
      id: '101',
    });
    expect(service.createCourse('NestJS', 'CS301')).toEqual({
      message: 'Course created',
      data: { name: 'NestJS', code: 'CS301' },
    });
  });
});
