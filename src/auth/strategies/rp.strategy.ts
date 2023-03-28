import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';

/*
    passport:
    - takes the JWT token, 
    - it decodes it in a 'payload'
    - attaches payload to the 'req.user'
*/

@Injectable()
export class RpStrategy extends PassportStrategy(Strategy, 'jwt-rp') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.RT_SECRET,
        });
    }

    async validate(payload: any) {
        return payload;
    }
}