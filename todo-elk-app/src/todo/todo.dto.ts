export class CreateTodoDto {
  readonly title: string;
  readonly description?: string;
}

export class UpdateTodoDto {
  readonly title?: string;
  readonly description?: string;
  readonly completed?: boolean;
} 