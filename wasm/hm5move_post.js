const hm5move = Module.cwrap(
  'hm5move',
  'string',
  ['string', 'number', 'number', 'number'],
);

const PATH_PATTERN = /^((0000|[1-9a-e]{2}[a-u][0-7])\/?)*$/;

function getVisitedNodes() {
  return Module._getVisitedNodes();
}

function isValidPath(path) {
  return PATH_PATTERN.test(path);
}

function depth(level) {
  switch (level) {
    case 2:
    case 3:
      return 10;
    default:
      return 3;
  }
}

function limit(level, player) {
  // Give Orange more time than Violet
  const multiplier = [0.9, 1.1][player];

  switch (level) {
    case 2:
      return 50 * multiplier;
    case 3:
      return 500 * multiplier;
    default:
      return 50 * multiplier;
  }
}

function temperature(level) {
  switch (level) {
    case 2:
      return 1.5;
    case 3:
      return 1.0;
    default:
      return 2.0;
  }
}

function handle(data) {
  const {path, level} = data;

  if (isValidPath(path)) {
    const start = Date.now();
    const player = path.split('/').length % 2;
    const move = hm5move(
      path,
      depth(level),
      limit(level, player),
      temperature(level),
    );
    const elapsed = (Date.now() - start) / 1000;
    postMessage({move, nps: getVisitedNodes() / elapsed});
  } else {
    postMessage({move: 'XXXX invalid path'});
  }
}

let ready = false;
let onReady;
let failed = false;

function fail() {
  if (failed) {
    return;
  }

  failed = true;
  postMessage({type: 'error'});
}

addEventListener('message', (event) => {
  if (ready) {
    handle(event.data);
  } else {
    onReady = () => handle(event.data);
  }
});

Module.onAbort = fail;
addEventListener('unhandledrejection', fail);

Module.onRuntimeInitialized = () => {
  ready = true;
  if (onReady) {
    onReady();
  }
};
