import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '  Este backend está alojado en Render y puede tardar unos segundos en responder debido al cold start. Ahora que el backend esta despierto puedes ingresar al website => https://authf-yama.vercel.app/';
  }
}
