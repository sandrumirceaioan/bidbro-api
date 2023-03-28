import { IsBoolean, IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/users.schema";
import { Tokens } from "./token.types";

export class RegisterRequest {
    @ApiProperty({ example: 'user@email.com' })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({ example: '12345678' })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({ example: 'John' })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({ example: '1987-06-24' })
    @IsNotEmpty()
    @IsString()
    birthDate: Date;

    @ApiProperty({ example: 'male' })
    @IsNotEmpty()
    @IsString()
    gender: 'male' | 'female';

    @ApiProperty({ example: 'user' })
    role: 'admin' | 'user';
}

export class RegisterResponse {
    tokens: Tokens
}

export class LoginRequest {
    @ApiProperty({ example: 'user@email.com' })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({ example: '12345678' })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({ example: 'true/false' })
    remember?: boolean;
}

export class RefreshRequest {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1N3453453456IkpXVCJ9.eyJzdWIiOiIxMjM0NTY456456456456ZSI6IkpvaG4gRG9lIiwiaWF0Ijox567675MDIyfQ.SflKxwRJSMeKKF2QT4h6hj8kfg77565676yJV_adQssw5c' })
    @IsNotEmpty()
    @IsString()
    refreshToken: string
}

export class LoginResponse {
    @ApiProperty()
    user: User;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' })
    tokens: Tokens;
}

export class ResetPasswordInitRequest {
    @ApiProperty({ example: 'user@email.com' })
    email: string;
}

export class ResetPasswordRequest {
    @ApiProperty({ example: '12345' })
    password: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' })
    token: string;
}

export class ResetResponse {
    @ApiProperty({ example: 200 })
    status: number;

    @ApiProperty({ example: 'example@domain.mailgun.org' })
    id: string;

    @ApiProperty({ example: 'Queued. Thank you.' })
    message: string;
}