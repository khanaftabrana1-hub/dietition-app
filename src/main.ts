import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/transform.interceptor.js';
import { AllExceptionsFilter } from './common/http-exception.filter.js';


async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 3000;
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();