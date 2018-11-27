/* globals Workspace */
'use strict';

new Workspace(document.getElementById('space-2'));
new Workspace(document.getElementById('space-3'));

var s1 = new Workspace(document.getElementById('space-1'));
s1.on('evaluate', ({code, index}) => {
  window.setTimeout(() => {
    const div = s1.append(index, 'echo: ' + code);
    window.setTimeout(() => {
      s1.update(div, '-> ' + code);
    }, 1000);
  }, 1000);
});
