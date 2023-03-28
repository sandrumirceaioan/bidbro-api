import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorators';

@ApiTags('Api')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  // status
  @Public()
  @ApiOperation({
    summary: ' - status check',
  })
  @Get()
  apiStatus(): string {
    return this.appService.status();
  }

}
