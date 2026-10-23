import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  getAllCourses() {
    return this.courseService.getAllCourses();
  }

  @Get(':id')
  getCourseById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  @Post()
  createCourse(@Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(dto);
  }

  @Put(':id')
  updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.courseService.updateCourse(id, dto);
  }

  @Patch(':id')
  patchCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.courseService.patchCourse(id, dto);
  }

  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.courseService.deleteCourse(id);
  }

  @Post(':id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'src', 'uploads'),
        filename: (_request, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          callback(null, `${Date.now()}-${randomUUID()}${extension}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.has(extension)) {
          callback(
            new BadRequestException(
              'Only .jpg, .jpeg, .png and .pdf files are allowed',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadCourseMaterial(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('A valid file is required');
    }
    return this.courseService.uploadCourseMaterial(id, file);
  }
}
