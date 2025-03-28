import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoModule } from './todo/todo.module';
import { LoggerService } from './logger/logger.service';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://mongodb:27017/todos'),
    TodoModule
  ],
  providers: [LoggerService],
})
export class AppModule {}
