import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
          <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
              <p>⚠️ <strong>This backend is hosted on Render</strong> and may take a few seconds to respond due to cold start.</p>
              <p>Now that we know for sure that the backend is awake, you can access the website:</p>
              <a href="https://authf-yama.vercel.app/" target="_blank" style="font-size: 18px; color: blue; text-decoration: none;">
                👉 Go to the website
              </a>
              <p>Thank You for understanding</p>
          </div>
    `
  }
}
