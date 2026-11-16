import ora from 'ora';

export interface SpinnerHandle {
  stop(): void;
}

export interface SpinnerService {
  start(text: string): SpinnerHandle;
}

export function createSpinnerService(): SpinnerService {
  return {
    start(text: string): SpinnerHandle {
      const spinner = ora({ text, stream: process.stdout, discardStdin: false }).start();

      return {
        stop: () => spinner.stop(),
      };
    },
  };
}
