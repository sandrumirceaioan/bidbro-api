import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './categories.schema';
import { SharedService } from '../common/modules/shared/shared.service';
import { pick } from 'lodash';
import { CreateCategory } from './categories.types';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        private sharedService: SharedService
    ) { }

    // METHODS

    async save(user: Category): Promise<Category> {
        return new this.categoryModel(user).save();
    }

    async find(query, options?): Promise<Category[]> {
        options = this.sharedService.validateOptions(options);
        return this.categoryModel.find(query).sort(options.sort).skip(options.skip).limit(options.limit).select(options.select).lean();
    }

    async findOne(query, options?): Promise<Category> {
        options = this.sharedService.validateOptions(options);
        return this.categoryModel.findOne(query).select(options.select).lean();
    }

    async findById(id, options?): Promise<Category> {
        options = this.sharedService.validateOptions(options);
        return this.categoryModel.findById(id).select(options.select).lean();
    }

    async findByIds(ids: string[], options?): Promise<Category> {
        options = this.sharedService.validateOptions(options);
        return this.categoryModel.find({ '_id': { $in: ids } }).sort(options.sort).skip(options.skip).limit(options.limit).select(options.select).lean();
    }

    async findOneAndUpdate(query, update, options?): Promise<Category> {
        options = this.sharedService.validateOptions(options);
        return this.categoryModel.findOneAndUpdate(query, update, pick(options, "new", "upsert")).lean();
    }

    async findByIdAndUpdate(id, update, options?): Promise<Category> {
        options = this.sharedService.validateOptions(options);
        return this.categoryModel.findByIdAndUpdate(id, update, pick(options, "new", "upsert")).lean();
    }

    async count(query): Promise<number> {
        return this.categoryModel.countDocuments(query).lean();
    }

    async remove(id) {
        return this.categoryModel.findByIdAndRemove(id);
    }


    // CUSTOM METHODS

    async createCategory(body: CreateCategory, userId: string): Promise<Category> {
        const parent = await this.findById(body.parent, { select: '_id' });
        if (!parent) throw new HttpException('Parent category not found', HttpStatus.BAD_REQUEST);

        const newCategory: Category = {
            ...body,
            parent: parent ? parent['_id'].toString() : null,
            status: false,
            updatedBy: userId,
        };

        return await this.save(newCategory);
    }



    // SCRIPTS

    // async createCategoryTree(list: any[], parent: string | null = null) {
    //     await Promise.all(list.map(async (category: any) => {
    //         let newCategory = {
    //             url: category.url,
    //             name: category.name,
    //             summary: null,
    //             description: null,
    //             thumbnail: null,
    //             banner: null,
    //             status: false,
    //             parent: parent,
    //         };
    //         let savedCategory = await this.save(newCategory);
    //         if (savedCategory) {
    //             if (category.sub && category.expand) {
    //                 await this.createCategoryTree(category.sub, savedCategory['_id'].toString());
    //             }
    //         } else {
    //             throw new HttpException('Could not save category', HttpStatus.INTERNAL_SERVER_ERROR)
    //         }
    //     }));
    // }

}
