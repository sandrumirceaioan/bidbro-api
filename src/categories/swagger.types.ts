import { Category } from "./categories.schema";
import { CategoriesResponse, CreateCategory } from "./categories.types";
// import { } from "./categories.types";

export const categoriesSwagger = {
    create: {
        req: {
            type: CreateCategory,
        },
        res: {
            status: 200,
            type: Category,
        }
    },
    paginated: {
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
        res: {
            status: 200,
            type: CategoriesResponse
        }
    },
    one: {
        res: {
            status: 200,
            type: Category,
        }
    }
}