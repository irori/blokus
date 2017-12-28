import { Move } from './board.js'

export default class WorkerBackend {
  constructor(handler) {
    this.worker = new Worker('js/hm5move.js');
    this.worker.addEventListener('message', (e) => {
      var move = new Move(e.data.move);
      console.log(e.data.nps + ' nps');
      this.handler(move);
    });
    this.handler = handler;
  }

  request(path, level) {
    this.worker.postMessage({path, level});
  }
}
