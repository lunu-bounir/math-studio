/* globals sandbox, notify */
'use strict';

document.addEventListener('dragover', e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}, false);
document.addEventListener('drop', e => {
  e.preventDefault();
  e.stopPropagation();

  [...e.dataTransfer.files].filter(f => f.name.toLowerCase().endsWith('.js'))
    .forEach(file => {
      const reader = new FileReader();
      notify.display(`"${file.name}" is imported.`, 'info');
      reader.addEventListener('load', () => sandbox.contentWindow.postMessage({
        method: 'import',
        code: reader.result
      }, '*'));
      reader.readAsText(file);
    });
}, false);
