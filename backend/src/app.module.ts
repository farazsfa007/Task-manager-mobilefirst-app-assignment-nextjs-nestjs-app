import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { WeatherModule } from './weather/weather.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
    AuthModule,
    TasksModule,
    WeatherModule,
    MailModule,
    UploadModule,
  ],
})
export class AppModule {}
