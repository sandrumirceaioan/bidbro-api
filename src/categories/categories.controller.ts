import { Controller, Get, Query, Body, SetMetadata, UseGuards, Post, HttpException, HttpStatus, Param, UseInterceptors, UploadedFile, UploadedFiles, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from '@nestjs/passport';
import { categories } from './categories.mock';
import { CreateCategory } from './categories.types';
import { GetCurrentUserId } from '../common/decorators/current-user-id.decorator';
import { Category } from './categories.schema';
import { CategoriesService } from './categories.service';
import { categoriesSwagger } from './swagger.types';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';

@ApiTags('Categories Module Api')
@ApiBearerAuth('JWT')
@SetMetadata('roles', 'admin')
@Controller('categories')

export class CategoriesController {
    apiUrl: string;

    constructor(
        private categoriesService: CategoriesService,
        private configService: ConfigService
    ) {
        this.apiUrl = this.configService.get('API_URL');
    }

    @ApiBody(categoriesSwagger.create.req)
    @ApiResponse(categoriesSwagger.create.res)
    @Post()
    async addCategory(
        @Body() body: CreateCategory,
        @GetCurrentUserId() userId: string
    ): Promise<Category> {
        return this.categoriesService.createCategory(body, userId);
    }

    @ApiQuery(categoriesSwagger.paginated.sort)
    @ApiQuery(categoriesSwagger.paginated.search)
    @ApiQuery(categoriesSwagger.paginated.limit)
    @ApiQuery(categoriesSwagger.paginated.skip)
    @ApiQuery(categoriesSwagger.paginated.direction)
    @ApiResponse(categoriesSwagger.paginated.res)
    @Get('/')
    async getCategories(
        @Query() params
    ) {
        let { skip, limit, sort, direction, search } = params;
        let query = {};

        if (search) {
            query = Object.assign(query, {
                $or: [
                    { 'url': new RegExp(search, 'i') },
                    { 'name': new RegExp(search, 'i') },
                    { 'summary': new RegExp(search, 'i') },
                    { 'description': new RegExp(search, 'i') }
                ]
            })
        }

        let options: any = {
            skip: skip ? parseInt(skip) : 0,
            limit: limit ? parseInt(limit) : null,
        }

        if (sort && direction) {
            options = Object.assign(options, {
                sort: {
                    [sort]: direction === 'asc' ? 1 : -1
                }
            })
        }

        return {
            count: await this.categoriesService.count(query),
            categories: (await this.categoriesService.find(query, options)).map((category: Category) => {
                if (category.thumbnail) {
                    category.thumbnail = `${this.apiUrl}/thumbnails/${category.thumbnail}`;
                }
                return category;
            })
        }
    }

    @ApiResponse(categoriesSwagger.one.res)
    @Get('/:id')
    async getCostByID(
        @Param('id') id: string
    ) {
        let category = await this.categoriesService.findById(id);
        category['thumbnail'] = `${this.apiUrl}/thumbnails/${category.thumbnail}`;
        return category;
    }


    @ApiConsumes('multipart/form-data')
    @Put('/:id')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
    ], {
        storage: diskStorage({
            destination: function (req, file, callback) {
                if (file.fieldname === 'thumbnail') {
                    callback(null, 'assets/thumbnails');
                } else if (file.fieldname === 'banner') {
                    callback(null, 'assets/banners');
                } else {
                    callback(null, 'assets/uploads');
                }
            },
            filename: (req, file, cb) => {
                let datetimestamp = Date.now();
                cb(null, file.originalname);
            }
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return callback(new HttpException('Only image files are allowed', HttpStatus.BAD_REQUEST), false);
            }
            callback(null, true)
        },
    }))

    async uploadedImage(
        @UploadedFiles() files: { thumbnail?: Express.Multer.File[], banner?: Express.Multer.File[] }, @Body() body, @Param('id') id: string
    ) {

        let newCategory: CreateCategory = {
            url: body.url,
            name: body.name,
            summary: body.summary || null,
            description: body.description || null,
            status: body.status === 'true' ? true : false,
            thumbnail: files.thumbnail && files.thumbnail[0] ? files.thumbnail[0]['originalname'] : null,
            banner: files.banner && files.banner[0] ? files.banner[0]['originalname'] : null
        };

        return await this.categoriesService.findByIdAndUpdate(id, newCategory)
    }

}