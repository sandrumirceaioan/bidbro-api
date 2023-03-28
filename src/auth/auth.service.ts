import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/users.schema';
import { SHA256 } from 'crypto-js';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordInitRequest, ResetPasswordRequest } from './types/auth.types';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '../common/modules/shared/shared.service';
import { hash, compareSync } from 'bcrypt';
import { Tokens } from './types/token.types';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private sharedService: SharedService
    ) { }

    // register
    async localRegister(body: RegisterRequest): Promise<RegisterResponse> {
        const exist = await this.usersService.findOne({ email: body.email }, { select: 'email' });
        if (exist && exist.email) throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);

        const newUser = await this.usersService.save({
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            birthDate: body.birthDate,
            gender: body.gender,
            role: body.role ? body.role : 'user',
            atHash: await this.hashData(body.password),
            status: true // TBD if we keep statuses
        });

        // generate one set of tokens - hashed acces token needed for login password comparation
        const tokens = await this.getTokens(newUser['_id'].toString(), newUser.role, newUser.email);
        await this.updateRtHash(newUser['_id'].toString(), tokens.refresh_token);
        return { tokens };
    }

    // login
    async localLogin(body: LoginRequest): Promise<LoginResponse> {
        // check for user in database using email address provided
        const user = await this.usersService.findOne({ email: body.email });
        if (!user) throw new UnauthorizedException('User not found');

        // compare provided password with user hashed access token 
        const correctPassword = await compareSync(body.password, user.atHash);
        if (!correctPassword) throw new UnauthorizedException('Access denied');

        // generate new set of tokens and update user rtHash for following comparations
        const tokens = await this.getTokens(user['_id'].toString(), user.role, user.email, body.remember);
        await this.updateRtHash(user['_id'].toString(), tokens.refresh_token);
        return { user, tokens };
    }

    // logout
    async logout(userId: string) {
        // delete hashed refresh token to prevent being used for new refresh token calls
        await this.usersService.findOneAndUpdate({
            _id: userId,
            rtHash: { $ne: null }
        }, { rtHash: null });

        return;
    }

    // refresh
    async refreshTokens(userId: string, rt: string): Promise<LoginResponse> {
        // check if user exists - we need refresh token from it for compatation
        const user = await this.usersService.findById(userId);
        if (!user || !user.rtHash) throw new UnauthorizedException('User not found');

        // compare received refresh token with hasged refresh token from user
        const rtMatches = await compareSync(rt, user.rtHash);
        if (!rtMatches) throw new UnauthorizedException('Refresh access denied');

        // generate new set of tokens and update user rtHash for following comparations
        const tokens = await this.getTokens(userId, user.role, user.email);
        await this.updateRtHash(userId, tokens.refresh_token);
        return { user, tokens };
    }

    // helper - update rtHash
    private async updateRtHash(userId: string, rt: string) {
        const hash = await this.hashData(rt);
        await this.usersService.findByIdAndUpdate(userId, { rtHash: hash });
    }

    // helper - hash data with bcrypt
    private hashData(data: string): Promise<string> {
        return hash(data, 10);
    }

    // helper - generate at and rt tokens
    private async getTokens(userId: string, userRole: string, userEmail: string, remember = false): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                id: userId,
                role: userRole,
                email: userEmail,
            }, {
                secret: this.configService.get<string>('AT_SECRET'),
                expiresIn: remember ? '15d' : '15m' // 15 minutes (or 15 days with remember)
            }),
            this.jwtService.signAsync({
                id: userId,
                role: userRole,
                email: userEmail,
            }, {
                secret: this.configService.get<string>('RT_SECRET'),
                expiresIn: remember ? '30d' : '1w' // 1 week (or 30 days with remember)
            })
        ]);
        return {
            access_token: at,
            refresh_token: rt
        }
    }

    // reset password
    async resetPasswordInit(body: ResetPasswordInitRequest) {
        let user: User | any = await this.usersService.findOne({ email: body.email }, { select: '_id email role' });
        if (user && user._id && user.email) {

            const token = await this.jwtService.signAsync({
                id: user._id,
                role: user.role,
                email: user.email,
            }, {
                secret: this.configService.get<string>('RP_SECRET'),
                expiresIn: '5m'
            });

            if (!token) throw new HttpException('Could not generate reset token', HttpStatus.INTERNAL_SERVER_ERROR);

            try {
                const mailer = await this.sharedService.sendMail(user.email, token);
                if (mailer) return mailer;
            } catch (error) {
                console.log(error);
                throw new HttpException('Could not send reset password email', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            throw new HttpException('There is no account registered with this email', HttpStatus.BAD_REQUEST);
        }
    }

    async resetPassword(body: ResetPasswordRequest): Promise<any> {
        return new Promise(async (resolve, reject) => {
            await this.jwtService.verifyAsync(body.token, { secret: this.configService.get<any>('RP_SECRET') }).then(async (valid) => {
                if (valid) {
                    //let newPassword = SHA256(body.password, this.configService.get('CRYPTO_KEY')).toString();
                    let newPassword = await this.hashData(body.password);
                    const updated = await this.usersService.findByIdAndUpdate(valid.id, { atHash: newPassword }, { new: true });
                    if (updated) {
                        // generate one set of tokens - hashed acces token needed for login password comparation
                        const tokens = await this.getTokens(updated['_id'].toString(), updated.role, updated.email);
                        await this.updateRtHash(updated['_id'].toString(), tokens.refresh_token);
                        resolve({ tokens });
                    } else {
                        reject(new Error('User password NOT updated'))
                    }
                }
            }).catch(error => {
                reject(new Error('Token invalid'));
            });
        });
    }

}