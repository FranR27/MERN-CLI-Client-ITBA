import type { HttpFailure, HttpResponseData } from '../http/types.js';
import type { PrintFunction } from '../utils/print.js';
import { formatFailure, formatResponse } from './response.js';
import { createSpinnerService, type SpinnerService } from './spinner.js';

export interface UiService {
  runWithSpinner<T>(label: string, task: () => Promise<T>): Promise<T>;
  showResponse(response: HttpResponseData): void;
  showFailure(failure: HttpFailure): void;
}

export function createUiService(
  print: PrintFunction,
  spinner: SpinnerService = createSpinnerService(),
): UiService {
  return {
    async runWithSpinner<T>(label: string, task: () => Promise<T>): Promise<T> {
      const handle = spinner.start(label);

      try {
        return await task();
      } finally {
        handle.stop();
      }
    },

    showResponse: (response) => print(formatResponse(response)),
    showFailure: (failure) => print(formatFailure(failure)),
  };
}
