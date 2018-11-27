var Workspace = function(root) {
  Object.assign(this, {
    root,
    index: 0,
    blocks: [],
    events: [],
    active: null
  });
  this.build(root);
};
Workspace.prototype.build = function() {
  this.block();
};
Workspace.prototype.block = function() {
  const root = document.createElement('div');
  root.classList.add('block');
  this.blocks.push(root);
  const textarea = document.createElement('textarea');
  textarea.classList.add('query');
  textarea.setAttribute('spellcheck', 'false');
  this.autosize(textarea);
  root.input = textarea;
  textarea.root = root;
  const div = document.createElement('div');
  root.results = div;
  root.appendChild(textarea);
  root.appendChild(div);
  this.root.appendChild(root);
  root.index = this.index;
  this.index += 1;
  this.keypress(root);
  textarea.focus();

  textarea;
};
Workspace.prototype.autosize = function(textarea, min = 20) {
  textarea.addEventListener('input', () => {
    textarea.style.height = min + 'px';
    textarea.style.height = Math.max(textarea.scrollHeight, 20) + 'px';
  });
  textarea.dispatchEvent(new Event('input'));
};
Workspace.prototype.keypress = function(root) {
  root.input.addEventListener('focus', e => this.active = e.target.root);
  root.addEventListener('keypress', e => {
    if (e.code === 'Enter' && e.shiftKey) {
      return;
    }
    else if (e.code === 'Enter') {
      e.preventDefault();
      this.next();
      if (e.target) {
        e.target.root.results.textContent = '';
        if (e.target.value) {
          e.target.root.dataset.busy = true;
          this.emit('evaluate', {
            code: e.target.value,
            index: e.target.root.index
          });
        }
        else {
          const div = this.append(e.target.root.index, 'Empty');
          div.classList.add('empty');
        }
      }
      else {
        e.target.root.results.textContent = '';
      }
    }
  });
  root.addEventListener('keydown', e => {
    if (
      e.code === 'ArrowDown' &&
      e.target.selectionStart === e.target.selectionEnd &&
      e.target.selectionStart === e.target.value.length
    ) {
      e.preventDefault();
      this.next();
    }
    else if (e.code === 'ArrowUp' &&
      e.target.selectionStart === e.target.selectionEnd &&
      e.target.selectionStart === 0
    ) {
      e.preventDefault();
      this.previous();
    }
  });
};
Workspace.prototype.previous = function() {
  const block = this.active;
  if (block) {
    const index = block.index;
    if (index === 0) {
      return;
    }
    this.blocks[index - 1].input.focus();
    this.blocks[index - 1].input.select();
  }
};

Workspace.prototype.next = function() {
  const block = this.active;
  if (block) {
    const index = block.index;
    if (index === this.blocks.length - 1) {
      this.block();
    }
    else {
      this.blocks[index + 1].input.focus();
      this.blocks[index + 1].input.select();
    }
  }
};

Workspace.prototype.append = function(index, result) {
  if (typeof result === 'string' || typeof result === 'number') {
    const pre = document.createElement('pre');
    pre.textContent = result || 'Empty';
    result = pre;
  }
  result.classList.add('result');
  this.blocks[index].results.appendChild(result);
  this.blocks[index].dataset.busy = false;
  return result;
};
Workspace.prototype.update = function(div, result) {
  if (typeof result === 'string') {
    div.textContent = result;
  }
  else {
    div.parentNode.replaceChild(result, div);
  }
};
// Events
Workspace.prototype.on = function(name, callback) {
  this.events[name] = this.events[name] || [];
  this.events[name].push(callback);
};
Workspace.prototype.emit = function(name, data) {
  (this.events[name] || []).forEach(c => c(data));
};
