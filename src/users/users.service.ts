import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import { SharedService } from '../common/modules/shared/shared.service';
import { pick } from 'lodash';
import { SHA256 } from 'crypto-js';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private sharedService: SharedService
    ) { }

    async save(user: User): Promise<User> {
        return new this.userModel(user).save();
    }

    async find(query, options?): Promise<User[]> {
        options = this.sharedService.validateOptions(options);
        return this.userModel.find(query).sort(options.sort).skip(options.skip).limit(options.limit).select(options.select).lean();
    }

    async findOne(query, options?): Promise<User> {
        options = this.sharedService.validateOptions(options);
        return this.userModel.findOne(query).select(options.select).lean();
    }

    async findById(id, options?): Promise<User> {
        options = this.sharedService.validateOptions(options);
        return this.userModel.findById(id).select(options.select).lean();
    }

    async findByIds(ids: string[], options?) {
        options = this.sharedService.validateOptions(options);
        return this.userModel.find({ '_id': { $in: ids } }).sort(options.sort).skip(options.skip).limit(options.limit).select(options.select).lean();
    }

    async findOneAndUpdate(query, update, options?): Promise<User> {
        options = this.sharedService.validateOptions(options);
        return this.userModel.findOneAndUpdate(query, update, pick(options, "new", "upsert")).lean();
    }

    async findByIdAndUpdate(id, update, options?): Promise<User> {
        options = this.sharedService.validateOptions(options);
        return this.userModel.findByIdAndUpdate(id, update, pick(options, "new", "upsert")).lean();
    }

    async count(query): Promise<number> {
        return this.userModel.countDocuments(query).lean();
    }

    async remove(id) {
        return this.userModel.findByIdAndRemove(id);
    }
}
