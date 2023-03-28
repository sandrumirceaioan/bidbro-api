import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiExcludeEndpoint } from "@nestjs/swagger";

import { Public } from '../common/decorators/public.decorators';
import { AuthService } from './auth.service';

import { AuthGuard } from '@nestjs/passport';
import { Request } from "express";
import { authSwagger } from './types/swagger.types';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordInitRequest, ResetPasswordRequest } from './types/auth.types';
import { JwtPayload } from './types/jwt-payload.types';
import { JwtService } from '@nestjs/jwt';
import { GetCurrentUserId } from '../common/decorators/current-user-id.decorator';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private configService: ConfigService,
        private jwtService: JwtService
    ) {
    }

    // *** LOCAL AUTH *** //

    // register
    @Public()
    @ApiBody(authSwagger.register.req)
    @ApiResponse(authSwagger.register.res)
    @ApiOperation({
        summary: ' - register user'
    })
    @HttpCode(HttpStatus.CREATED)
    @Post('/local/register')
    async localRegister(@Body() body: RegisterRequest): Promise<RegisterResponse> {
        return await this.authService.localRegister(body);
    }

    // login
    @Public()
    @ApiBody(authSwagger.login.req)
    @ApiResponse(authSwagger.login.res)
    @ApiOperation({
        summary: ' - login user'
    })
    @HttpCode(HttpStatus.OK)
    @Post('/local/login')
    async localLogin(@Body() body: LoginRequest) {
        return await this.authService.localLogin(body);
    }

    // logout
    @ApiBearerAuth('JWT')
    @ApiOperation({
        summary: ' - logout user'
    })
    @Post('/local/logout')
    async logout(@GetCurrentUserId() userId: string) {
        return await this.authService.logout(userId);
    }

    // refresh
    @Public()
    @ApiBearerAuth('JWT')
    @ApiBody(authSwagger.refresh.req)
    @ApiResponse(authSwagger.refresh.res)
    @ApiOperation({
        summary: ' - refresh user'
    })
    @Post('/local/refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(
        @Body() body: any,
    ): Promise<LoginResponse> {
        if (body.refreshToken) {
            return this.jwtService.verifyAsync(body.refreshToken, { secret: this.configService.get<any>('RT_SECRET') }).then((payload: JwtPayload) => {
                return this.authService.refreshTokens(payload.id, body.refreshToken);
            }).catch(error => {
                console.log('REFRESH ERROR: ', error.message);
                throw new HttpException('Refresh token expired', HttpStatus.BAD_REQUEST);
            });
        } else {
            throw new HttpException('Could not refresh tokens', HttpStatus.BAD_REQUEST);
        }
    }

    // verify
    @ApiBearerAuth('JWT')
    @ApiOperation({
        summary: ' - verify user'
    })
    @Post('/local/verify')
    @HttpCode(HttpStatus.OK)
    async verifyToken(
        @GetCurrentUserId() userId: string
    ) {
        return await this.usersService.findById(userId);
    }

    // reset init
    @Public()
    @ApiBody(authSwagger.resetinit.req)
    @ApiResponse(authSwagger.resetinit.res)
    @ApiOperation({
        summary: ' - reset user password init'
    })
    @Post('/local/reset-init')
    async resetInit(
        @Body() body: ResetPasswordInitRequest
    ) {
        return await this.authService.resetPasswordInit(body);
    }

    // reset complete
    @Public()
    @ApiBody(authSwagger.reset.req)
    @ApiResponse(authSwagger.reset.res)
    @ApiOperation({
        summary: ' - reset user password complete'
    })
    @Post('/local/reset-complete')
    async reset(
        @Body() body: ResetPasswordRequest
    ) {
        return await this.authService.resetPassword(body);
    }

    
    // *** LOCAL AUTH *** //

    // init facebook login
    @ApiExcludeEndpoint()
    @Public()
    @Get('/facebook')
    @UseGuards(AuthGuard("facebook"))
    async facebookLogin(): Promise<any> {
        return HttpStatus.OK;
    }

    // postback facebook login
    @ApiExcludeEndpoint()
    @Public()
    @Get('/facebook/redirect')
    @UseGuards(AuthGuard('facebook'))
    async facebookLoginRedirect(@Req() req: Request): Promise<any> {
        return {
            statusCode: HttpStatus.OK,
            data: req.user,
        };
    }

}


