import { Move } from './move.ts';

export default class WorkerBackend {
  private worker: Worker;
  private handler: (move: Move) => void;

  constructor(handler: (move: Move) => void) {
    this.handler = handler;
    this.worker = new Worker('hm5move.js');
    this.worker.addEventListener('message', (e) => {
      let move = new Move(e.data.move);
      console.log(`${move.fourcc()} (${e.data.nps} nps)`);
      this.handler(move);
    });
  }

  request(path: string, level: number) {
    this.worker.postMessage({path, level});
  }
}
