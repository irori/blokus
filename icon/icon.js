//var params = [60, 8, 12, bg_circle];  // FxOS
//var params = [128, 16, 28, bg_circle];  // Firefox marketplace
var params = [120, 18, 15, bg_square];  // apple-touch-icon

SIZE = params[0];
UNIT = params[1];
OFFSET = params[2];
BACKGROUND = params[3];

function bg_square(ctx) {
  ctx.beginPath();
  var grad  = ctx.createLinearGradient(0,0, 0,SIZE);
  grad.addColorStop(0, 'rgb(220, 220, 220)');
  grad.addColorStop(1, 'rgb(180, 180, 180)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function bg_circle(ctx) {
  ctx.beginPath();
  var grad  = ctx.createLinearGradient(0,0, 0,SIZE);
  grad.addColorStop(0, 'rgb(220, 220, 220)');
  grad.addColorStop(1, 'rgb(180, 180, 180)');
  ctx.fillStyle = grad;
  ctx.arc(SIZE/2, SIZE/2, SIZE/2-1, 0, Math.PI*2, false);
  ctx.fill();
}

function blocks(ctx) {
  var coords = [[0, 0], [1, 0],
                [1, 1], [2, 1],
                [1, 2],
                [3, 3], [4, 3],
                [1, 4], [2, 4], [3, 4]];

  for (var i = 0; i < coords.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = i < 5 ? 'rgb(102, 51, 221)' : 'rgb(255, 119, 34)';
    var x = coords[i][0] * UNIT + OFFSET;
    var y = coords[i][1] * UNIT + OFFSET;
    ctx.fillRect(x, y, UNIT, UNIT);
  }
}


var canvas = document.createElement('canvas');
canvas.setAttribute('width', SIZE);
canvas.setAttribute('height', SIZE);
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');

BACKGROUND(ctx);
blocks(ctx);

var png = canvas.toDataURL();
var img = document.createElement('img');
img.src = png;
document.body.appendChild(img);
