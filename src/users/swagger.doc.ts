import {ApiProperty} from "@nestjs/swagger";
import {User} from "./users.schema";

class UserDTO extends User {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    CreatedBy: string;
}

class UsersResDTO {
    @ApiProperty({ type: [] })
    users: UserDTO

    @ApiProperty({
        example: 13
    })
    count: number;

}

class UserReqDTO {
    @ApiProperty()
    email: string
    @ApiProperty()
    password: string
}

class AuthLoginResDTO {
    @ApiProperty()
    user: UserDTO
    @ApiProperty()
    token: string
}

class resOnlyMSGDTO {
    @ApiProperty()
    message: string
}



export const swaggerUsersDoc = {
    query: {
        skip: {
            name: 'skip',
            type: 'string',
            required: false
        },
        limit: {
            name: 'limit',
            type: 'string',
            required: false
        },
        sort: {
            name: 'sort',
            type: 'string',
            required: false
        },
        direction: {
            name: 'direction',
            type: 'string',
            required: false
        },
        search: {
            name: 'search',
            type: 'string',
            required: false
        },
    },
    res: {
        user_get_all_res: {
            status: 200,
            type: UsersResDTO,
        },
        auth_post_res: {
            status: 200,
            type: AuthLoginResDTO,
        },
        auth_reg_post_res: {
            status: 200,
            type: User,
        },

        user_get_only_res: {
            status: 200,
            type: UserDTO,
        },
        msg_res: {
            status: 200,
            type: resOnlyMSGDTO,
        },
    },

    req: {
        auth_post_req: {
            type: UserReqDTO,
        },
        auth_reg_post_req: {
            type: User,
        },
        onlyAdmin: {
            description: '<h2>Access End Point</h2><br/><ui><li>Admin</li></ui>'
        },
    },
}