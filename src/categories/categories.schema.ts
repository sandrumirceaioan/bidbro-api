import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from "@nestjs/swagger";

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ required: true })
  @ApiProperty({ example: 'category-name' })
  url: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'Category Name' })
  name: string;

  @Prop({ required: false })
  @ApiProperty({ example: 'Short category description...' })
  summary: string;

  @Prop({ required: false })
  @ApiProperty({ example: 'Category description text...' })
  description: string;

  @Prop({ default: false })
  @ApiProperty({ example: 'thumbnail-example.jpg' })
  thumbnail: string;

  @ApiProperty({ example: 'banner-example.png' })
  @Prop({ default: false })
  banner: string;

  @Prop({ default: null })
  parent: string;

  @Prop({ default: false })
  status: boolean;

  @Prop({ default: new Date() })
  createdAt?: Date;

  @Prop({ default: new Date() })
  updatedAt?: Date;

  @Prop({ default: 'script' })
  updatedBy?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);