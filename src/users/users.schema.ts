import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from "@nestjs/swagger";

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'John' })
  firstName: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @Prop({ required: true })
  @ApiProperty({ example: '1987-06-24' })
  birthDate: Date;

  @Prop({ required: true })
  @ApiProperty({ example: 'male' })
  gender: 'male' | 'female';

  @ApiProperty({ example: 'user' })
  @Prop({ required: false })
  role: 'admin' | 'user';

  @Prop({ required: false })
  status: boolean;

  @Prop({ required: true })
  atHash: string;

  @Prop({ required: false })
  rtHash?: string;

  @Prop({ required: false })
  photo?: string;

  @Prop({ required: false })
  loggedAt?: Date;

  @Prop({ default: new Date() })
  createdAt?: Date;

  @Prop({ default: new Date() })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);