import { Controller, Get} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    const result = this.appService.getHello();
    return result;
  }
}
