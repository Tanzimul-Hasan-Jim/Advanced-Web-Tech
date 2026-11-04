import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { PartialUpdateProductDto } from './dto/partial-update-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/products.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,
  ) {}

  async create(dto: CreateProductDto) {
    const product = this.productsRepo.create(dto);
    const savedProduct = await this.productsRepo.save(product);

    return { message: 'Product created successfully.', data: savedProduct };
  }

  async findAll() {
    const data = await this.productsRepo.find({
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Products retrieved successfully.',
      count: data.length,
      data,
    };
  }

  async findOne(id: number) {
    const product = await this.getProductOrThrow(id);

    return { message: 'Product retrieved successfully.', data: product };
  }

  async update(id: number, dto: PartialUpdateProductDto) {
    const product = await this.getProductOrThrow(id);
    const suppliedFields = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    this.productsRepo.merge(product, suppliedFields);
    const updatedProduct = await this.productsRepo.save(product);

    return { message: 'Product updated successfully.', data: updatedProduct };
  }

  async replace(id: number, dto: UpdateProductDto) {
    const product = await this.getProductOrThrow(id);

    this.productsRepo.merge(product, {
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      stock: dto.stock ?? 0,
      category: dto.category,
      isActive: dto.isActive ?? true,
    });

    const updatedProduct = await this.productsRepo.save(product);

    return { message: 'Product replaced successfully.', data: updatedProduct };
  }

  async remove(id: number) {
    const product = await this.getProductOrThrow(id);
    await this.productsRepo.delete(product.id);

    return { message: 'Product deleted successfully.', id: product.id };
  }

  async findByCategory(category: string) {
    const data = await this.productsRepo.find({
      where: { category },
      order: { createdAt: 'DESC' },
    });

    return {
      message: `Products in category "${category}" retrieved successfully.`,
      count: data.length,
      data,
    };
  }

  async search(keyword: string) {
    if (!keyword.trim()) {
      throw new BadRequestException('A non-empty search keyword is required.');
    }

    const data = await this.productsRepo.find({
      where: { name: ILike(`%${keyword}%`) },
      order: { createdAt: 'DESC' },
    });

    return {
      message: `Products matching "${keyword}" retrieved successfully.`,
      count: data.length,
      data,
    };
  }

  async toggleActive(id: number) {
    const product = await this.getProductOrThrow(id);
    product.isActive = !product.isActive;
    const updatedProduct = await this.productsRepo.save(product);

    return {
      message: 'Product active status toggled successfully.',
      data: updatedProduct,
    };
  }

  private async getProductOrThrow(id: number): Promise<Products> {
    const product = await this.productsRepo.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} was not found.`);
    }

    return product;
  }
}
