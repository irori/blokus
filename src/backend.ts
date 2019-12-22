import { Move } from './move.js';

export default class WorkerBackend {
  private worker: Worker;

  constructor(private handler: (move: Move) => void) {
    this.worker = new Worker('hm5move.js');
    this.worker.addEventListener('message', (e) => {
      let move = new Move(e.data.move);
      console.log(e.data.nps + ' nps');
      this.handler(move);
    });
  }

  request(path: string, level: number) {
    this.worker.postMessage({path, level});
  }
}
