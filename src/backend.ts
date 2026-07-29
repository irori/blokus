import { Move } from './move.ts';

// Avoid an unnaturally instant reply when the engine finishes quickly.
const MIN_RESPONSE_TIME = 500;

export default class WorkerBackend {
  private worker: Worker;
  private handler: (move: Move) => void;
  readonly failure: Promise<Error>;
  private resolveFailure!: (error: Error) => void;
  private requestedAt = 0;
  private failed = false;

  constructor(handler: (move: Move) => void) {
    this.handler = handler;
    this.failure = new Promise((resolve) => this.resolveFailure = resolve);
    this.worker = new Worker('hm5move.js');
    this.worker.addEventListener('message', (e) => {
      if (e.data.type == 'error') {
        this.fail(new Error('wasm_initialization'));
        return;
      }
      let move = new Move(e.data.move);
      console.log(`${move.fourcc()} (${e.data.nps} nps)`);
      this.reply(move);
    });
    this.worker.addEventListener(
      'error', () => this.fail(new Error('worker')));
  }

  request(path: string, level: number) {
    this.requestedAt = Date.now();
    this.worker.postMessage({path, level});
  }

  private reply(move: Move) {
    const delay = Math.max(
      0, MIN_RESPONSE_TIME - (Date.now() - this.requestedAt));
    if (delay)
      setTimeout(() => this.handler(move), delay);
    else
      this.handler(move);
  }

  private fail(error: Error) {
    if (this.failed)
      return;
    this.failed = true;
    this.worker.terminate();
    this.resolveFailure(error);
  }
}
