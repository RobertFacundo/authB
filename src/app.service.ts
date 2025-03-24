import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
     <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <p>⚠️ <strong>Este backend está alojado en Render</strong> y puede tardar unos segundos en responder debido al cold start.</p>
        <p>Ahora que el backend está despierto, puedes ingresar al website:</p>
        <a href="https://authf-yama.vercel.app/" target="_blank" style="font-size: 18px; color: blue; text-decoration: none;">
          👉 Ir al website
        </a>
      </div>
    `
  }
}
