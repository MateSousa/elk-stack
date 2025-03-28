import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todo.entity';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class TodoService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    private readonly logger: LoggerService,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const createdTodo = new this.todoModel(createTodoDto);
    const result = await createdTodo.save();
    this.logger.log('Todo created', { 
      action: 'create',
      todoId: result._id,
      todo: result 
    });
    return result;
  }

  async findAll(): Promise<Todo[]> {
    const todos = await this.todoModel.find().exec();
    this.logger.log('Todos retrieved', { 
      action: 'findAll',
      count: todos.length 
    });
    return todos;
  }

  async findOne(id: string): Promise<Todo> {
    const todo = await this.todoModel.findById(id).exec();
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    this.logger.log('Todo retrieved', { 
      action: 'findOne',
      todoId: id,
      todo 
    });
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const updatedTodo = await this.todoModel
      .findByIdAndUpdate(id, updateTodoDto, { new: true })
      .exec();
    if (!updatedTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    this.logger.log('Todo updated', { 
      action: 'update',
      todoId: id,
      updates: updateTodoDto 
    });
    return updatedTodo;
  }

  async remove(id: string): Promise<Todo> {
    const deletedTodo = await this.todoModel.findByIdAndDelete(id).exec();
    if (!deletedTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    this.logger.log('Todo deleted', { 
      action: 'delete',
      todoId: id 
    });
    return deletedTodo;
  }
} 