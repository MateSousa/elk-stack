import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './todo.entity';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';
import { LoggerService } from '../logger/logger.service';
import { Model } from 'mongoose';

describe('TodoService', () => {
  let service: TodoService;
  let todoModel: any;
  let loggerService: any;

  // Mock data
  const mockTodo = {
    _id: 'some-todo-id',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: new Date(),
  };

  const mockTodos = [
    { ...mockTodo },
    {
      _id: 'another-todo-id',
      title: 'Another Todo',
      description: 'Another Description',
      completed: true,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    // Create mock implementations
    // Mock the model constructor function
    const mockModelInstance = {
      save: jest.fn().mockResolvedValue(mockTodo),
    };
    
    todoModel = jest.fn().mockImplementation(() => mockModelInstance);
    
    // Add static methods to the model
    todoModel.find = jest.fn().mockReturnThis();
    todoModel.findById = jest.fn().mockReturnThis();
    todoModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    todoModel.findByIdAndDelete = jest.fn().mockReturnThis();
    todoModel.exec = jest.fn();

    loggerService = {
      log: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getModelToken(Todo.name),
          useValue: todoModel,
        },
        {
          provide: LoggerService,
          useValue: loggerService,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo successfully', async () => {
      // Arrange
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test Description',
      };
      
      // The model instance is already mocked in the beforeEach
      // When new todoModel() is called, it returns our mock instance with save method

      // Act
      const result = await service.create(createTodoDto);

      // Assert
      expect(result).toEqual(mockTodo);
      expect(loggerService.log).toHaveBeenCalledWith('Todo created', expect.objectContaining({
        action: 'create',
        todoId: mockTodo._id,
      }));
    });

    it('should handle error when saving fails', async () => {
      // Arrange
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test Description',
      };
      
      const error = new Error('Save failed');
      // Create a new mock instance for this specific test
      const mockInstance = {
        save: jest.fn().mockRejectedValue(error),
      };
      // Override the model implementation for this test
      todoModel.mockImplementation(() => mockInstance);

      // Act & Assert
      await expect(service.create(createTodoDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      // Arrange
      todoModel.exec.mockResolvedValue(mockTodos);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockTodos);
      expect(todoModel.find).toHaveBeenCalled();
      expect(todoModel.exec).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith('Todos retrieved', expect.objectContaining({
        action: 'findAll',
        count: mockTodos.length,
      }));
    });

    it('should return an empty array if no todos exist', async () => {
      // Arrange
      todoModel.exec.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(todoModel.find).toHaveBeenCalled();
      expect(todoModel.exec).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith('Todos retrieved', expect.objectContaining({
        action: 'findAll',
        count: 0,
      }));
    });
  });

  describe('findOne', () => {
    it('should return a single todo', async () => {
      // Arrange
      todoModel.exec.mockResolvedValue(mockTodo);

      // Act
      const result = await service.findOne('some-todo-id');

      // Assert
      expect(result).toEqual(mockTodo);
      expect(todoModel.findById).toHaveBeenCalledWith('some-todo-id');
      expect(todoModel.exec).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith('Todo retrieved', expect.objectContaining({
        action: 'findOne',
        todoId: 'some-todo-id',
      }));
    });

    it('should throw NotFoundException if todo not found', async () => {
      // Arrange
      todoModel.exec.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Todo with ID non-existent-id not found'),
      );
      expect(todoModel.findById).toHaveBeenCalledWith('non-existent-id');
      expect(todoModel.exec).toHaveBeenCalled();
      expect(loggerService.log).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a todo successfully', async () => {
      // Arrange
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Title',
        completed: true,
      };
      
      const updatedMockTodo = {
        ...mockTodo,
        title: 'Updated Title',
        completed: true,
      };
      
      todoModel.exec.mockResolvedValue(updatedMockTodo);

      // Act
      const result = await service.update('some-todo-id', updateTodoDto);

      // Assert
      expect(result).toEqual(updatedMockTodo);
      expect(todoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'some-todo-id',
        updateTodoDto,
        { new: true },
      );
      expect(todoModel.exec).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith('Todo updated', expect.objectContaining({
        action: 'update',
        todoId: 'some-todo-id',
        updates: updateTodoDto,
      }));
    });

    it('should throw NotFoundException if todo to update not found', async () => {
      // Arrange
      const updateTodoDto: UpdateTodoDto = { title: 'Updated Title' };
      todoModel.exec.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('non-existent-id', updateTodoDto)).rejects.toThrow(
        new NotFoundException('Todo with ID non-existent-id not found'),
      );
      expect(todoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'non-existent-id',
        updateTodoDto,
        { new: true },
      );
      expect(todoModel.exec).toHaveBeenCalled();
      expect(loggerService.log).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a todo successfully', async () => {
      // Arrange
      todoModel.exec.mockResolvedValue(mockTodo);

      // Act
      const result = await service.remove('some-todo-id');

      // Assert
      expect(result).toEqual(mockTodo);
      expect(todoModel.findByIdAndDelete).toHaveBeenCalledWith('some-todo-id');
      expect(todoModel.exec).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith('Todo deleted', expect.objectContaining({
        action: 'delete',
        todoId: 'some-todo-id',
      }));
    });

    it('should throw NotFoundException if todo to remove not found', async () => {
      // Arrange
      todoModel.exec.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        new NotFoundException('Todo with ID non-existent-id not found'),
      );
      expect(todoModel.findByIdAndDelete).toHaveBeenCalledWith('non-existent-id');
      expect(todoModel.exec).toHaveBeenCalled();
      expect(loggerService.log).not.toHaveBeenCalled();
    });
  });
});
