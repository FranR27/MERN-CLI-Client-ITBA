import { confirm, input, select } from '@inquirer/prompts';

export interface InputOptions {
  message: string;
  default?: string;
  validate?: (value: string) => true | string;
}

export interface SelectChoice<Value extends string> {
  value: Value;
  name: string;
  description?: string;
}

export interface SelectOptions<Value extends string> {
  message: string;
  choices: readonly SelectChoice<Value>[];
}

export interface ConfirmOptions {
  message: string;
  default?: boolean;
}

export interface PromptService {
  input(options: InputOptions): Promise<string>;
  select<Value extends string>(options: SelectOptions<Value>): Promise<Value>;
  confirm(options: ConfirmOptions): Promise<boolean>;
}

export const promptService: PromptService = {
  input: (options) =>
    input({
      message: options.message,
      default: options.default,
      validate: options.validate,
    }),

  select: async <Value extends string>(options: SelectOptions<Value>) =>
    select<Value>({
      message: options.message,
      choices: options.choices.map((choice) => ({
        value: choice.value,
        name: choice.name,
        ...(choice.description ? { description: choice.description } : {}),
      })),
      pageSize: Math.min(options.choices.length, 12),
      loop: true,
    }),

  confirm: (options) =>
    confirm({
      message: options.message,
      default: options.default ?? false,
    }),
};
