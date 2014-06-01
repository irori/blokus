var toolBarClosingTimer;

function openToolBar() {
  var toolbar = document.getElementById('toolbar');
  toolbar.classList.remove('closed');
  toolBarClosingTimer = setTimeout(closeToolBar, 5000);
}

function closeToolBar() {
  var toolbar = document.getElementById('toolbar');
  toolbar.classList.add('closed');
  clearTimeout(toolBarClosingTimer);
  toolBarClosingTimer = null;
}

function help() {
  var help = document.getElementById('help');
  help.classList.remove('closed');
  var toolbar = document.getElementById('toolbar');
  toolbar.classList.add('closed');
}

function reload() {
  window.location.reload();
}

function closeHelp() {
  var help = document.getElementById('help');
  help.classList.add('closed');
}

window.addEventListener('load', function() {
  var handler = document.getElementById('handler');
  handler.addEventListener('click', openToolBar);
  document.getElementById('reloadButton').addEventListener('click', reload);
  document.getElementById('helpButton').addEventListener('click', help);
  document.getElementById('closeButton').addEventListener('click', closeToolBar);
  document.getElementById('closeHelp').addEventListener('click', closeHelp);
}, false);
