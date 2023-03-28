import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as emoji from 'node-emoji';

@Injectable()
export class AppService {

  constructor(
    private configService: ConfigService
  ) { }

  status(): string {
    const rocket = emoji.get('rocket');
    const port = this.configService.get('PORT') || 3000;
    return `CTF API ${rocket} ${port}`;
  }
}
