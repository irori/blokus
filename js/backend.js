import { Move } from './move.js';
export default class WorkerBackend {
    constructor(handler) {
        this.handler = handler;
        this.worker = new Worker('dist/hm5move.js');
        this.worker.addEventListener('message', (e) => {
            let move = new Move(e.data.move);
            console.log(e.data.nps + ' nps');
            this.handler(move);
        });
    }
    request(path, level) {
        this.worker.postMessage({ path, level });
    }
}
