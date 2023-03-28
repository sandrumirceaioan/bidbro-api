import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsersService } from './users.service';

@ApiTags('User Module Api')
@ApiBearerAuth('JWT')
@SetMetadata('roles', 'admin')
@Controller('users')

export class UsersController {

    constructor(
        private usersService: UsersService,
    ) { }

    @Get('/')
    async findUsers(
        @Query() params
    ) {
        let { skip, limit, sort, direction, search, ...query } = params;
        query['active'] = true;

        if (search) {
            query = Object.assign(query, {
                $or: [
                    { 'firstName': new RegExp(search, 'i') },
                    { 'lastName': new RegExp(search, 'i') },
                    { 'email': new RegExp(search, 'i') },
                    { 'role': new RegExp(search, 'i') }
                ]
            })
        }

        let options: any = {
            skip: skip ? parseInt(skip) : 0,
            limit: limit ? parseInt(limit) : null,
            select: '-password'
        }

        if (sort && direction) {
            options = Object.assign(options, {
                sort: {
                    [sort]: direction === 'asc' ? 1 : -1
                }
            })
        }

        return {
            count: await this.usersService.count(query),
            users: await this.usersService.find(query, options)
        }
    }
}