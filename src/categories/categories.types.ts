import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Category } from "./categories.schema";

export class CreateCategory {
    @ApiProperty({ example: 'category-name' })
    @IsNotEmpty()
    @IsString()
    url: string;

    @ApiProperty({ example: 'Category Name' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'Short category description...' })
    @IsNotEmpty()
    @IsString()
    summary: string;

    @ApiProperty({ example: 'Category longer description...' })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({ example: 'thumbnail-example.jpg' })
    @IsString()
    thumbnail: string;

    @ApiProperty({ example: 'banner-example.png' })
    @IsString()
    banner: string;

    @ApiProperty({ example: 'true/false' })
    status: boolean;

    @ApiProperty({ example: 'f446743z356er6v533d812' })
    parent?: string;
}


export class CategoriesResponse {
    @ApiProperty({ example: 0 })
    count: number;

    @ApiProperty({ example: []})
    categories: Category[]
}