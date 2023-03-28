import { User } from "../../users/users.schema";
import { LoginRequest, LoginResponse, RefreshRequest, RegisterRequest, RegisterResponse, ResetPasswordInitRequest, ResetPasswordRequest, ResetResponse } from "./auth.types";

export const authSwagger = {
    login: {
        req: {
            type: LoginRequest,
        },
        res: {
            status: 200,
            type: LoginResponse,
        }
    },
    register: {
        req: {
            type: RegisterRequest,
        },
        res: {
            type: RegisterResponse
        }
    },
    refresh: {
        req: {
            type: RefreshRequest,
        },
        res: {
            type: LoginResponse
        }
    },
    resetinit: {
        req: {
            type: ResetPasswordInitRequest,
        },
        res: {
            status: 200,
            type: ResetResponse
        }
    },
    reset: {
        req: {
            type: ResetPasswordRequest,
        },
        res: {
            status: 200,
            type: Boolean
        }
    },
    verify: {
        res: {
            type: User
        }
    }
}