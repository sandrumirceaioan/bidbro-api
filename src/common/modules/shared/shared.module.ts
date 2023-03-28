import { Global, Module } from '@nestjs/common';
import { SharedService } from './shared.service';

@Global()
@Module({
    imports: [],
    providers: [SharedService],
    exports: [SharedService]
})
export class SharedModule { }
