/* globals Chart, Workspace, Notify */

const args = new URLSearchParams(location.search);
{
  const width = args.get('width');
  const height = args.get('height');

  if (width && height) {
    document.body.style.width = width + 'px';
    document.body.style.height = height + 'px';
  }
}

var notify = new Notify();

var sandbox = document.getElementById('sandbox');
window.addEventListener('message', e => {
  if (e.data.method === 'print') {
    let {results, types, index} = e.data;
    results.forEach((result, i) => {
      let type = types[i];
      if ((type === 'string' || type === 'error') && result[0] === '"') {
        result = result.substr(1, result.length - 2);
      }
      if (result === 'discard') {
        return;
      }
      else if (result === '') {
        type = 'empty';
      }
      else if (result.startsWith('chartjs://')) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        try {
          const data = JSON.parse(result.substr(10));
          console.log(data);
          new Chart(ctx, data);
        }
        catch (e) {
          console.error(e);
          result = e.message;
          type = 'error';
        }
        result = canvas;
      }

      const div = workspace.append(index, result);
      div.classList.add(type);
    });
  }
});

var workspace = new Workspace(document.getElementById('workspace'));
workspace.on('evaluate', ({code, index}) => sandbox.contentWindow.postMessage({
  method: 'evaluate',
  code,
  index
}, '*'));
{
  const input = workspace.blocks[0].input;
  input.placeholder = `Welcome to Math Studio

Type a math expression and hit the Enter key. You can use Shift + Enter to write a multi-line math expression. Also you can combine math with JS functions. For more info please see the FAQs page.

Examples:
  myVar = 1+2
  myMatrix = [1, 2; 3, 4]
  sin(1:10)
  plot(sin(1:10))
  help("plot")
  help("js")
  js("arr => arr.map(x => x + 1)", 1:10)`;
  input.style.height = '250px';
}
