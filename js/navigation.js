'use strict';

let toolBarClosingTimer;

function openToolBar() {
  let toolbar = document.getElementById('toolbar');
  toolbar.classList.remove('closed');
  toolBarClosingTimer = setTimeout(closeToolBar, 5000);
}

function closeToolBar() {
  let toolbar = document.getElementById('toolbar');
  toolbar.classList.add('closed');
  clearTimeout(toolBarClosingTimer);
  toolBarClosingTimer = null;
}

function help() {
  let help = document.getElementById('help');
  help.classList.remove('closed');
  let toolbar = document.getElementById('toolbar');
  toolbar.classList.add('closed');
}

function reload() {
  window.location.reload();
}

function closeHelp() {
  let help = document.getElementById('help');
  help.classList.add('closed');
}

window.addEventListener('load', () => {
  let handler = document.getElementById('handler');
  handler.addEventListener('click', openToolBar);
  document.getElementById('reloadButton').addEventListener('click', reload);
  document.getElementById('helpButton').addEventListener('click', help);
  document.getElementById('closeButton').addEventListener('click', closeToolBar);
  document.getElementById('closeHelp').addEventListener('click', closeHelp);
}, false);
