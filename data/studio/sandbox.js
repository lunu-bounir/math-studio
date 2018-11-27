/* globals math */
'use strict';

// mathjs
math.expression.docs.js = {
  category: 'JavaScript',
  description: 'Execute a block of a JS code and return the value. Always use double-quote around the JS block',
  examples: [
    'js("\'this is a string\'")',
    'js("x => x + 1", 1)',
    'js("arr => arr.map(a => a + 1)", 1:10)'
  ],
  name: 'js',
  seealso: [],
  syntax: [
    'js("JavaScript code", arg1, arg2, ...)'
  ]
};
// mathjs
math.expression.docs.plot = {
  category: 'Plotting',
  description: 'plot one or a group of curves in "line", "bar", "pie", or "doughnut" format.',
  examples: [
    'plot(sin(1:10))',
    'plot(sin(1:10), 1:10)',
    'plot(sin(1:10), 1:10, "bar")',
    'plot(sin(1:10), 1:10, "pie")',
    'plot(sin(1:10), 1:10, "doughnut")',
    `plot([{
  data: sin(1:10),
  backgroundColor: 'rgba(0, 0, 255, 0.5)',
  label: 'blue plot'
 }, {
  data: cos(1:10),
  backgroundColor: 'rgba(255, 0, 0, 0.5)',
  label: 'red plot'
 }])`,
    `plot([{
  data: [10, 30, 40],
  backgroundColor: ['red', 'blue', 'green']
}], ['plot a', 'plot b', 'plot c'], 'doughnut')`
  ],
  name: 'plot',
  seealso: [],
  syntax: [
    'plot(datasets, labels, type, options)'
  ]
};

math.import({
  js: (code, ...args) => {
    const rtn = eval(code);
    return typeof rtn === 'function' ? rtn(...args) : rtn;
  },
  plot: (datasets = [], labels = [], type = 'line', options = {}) => {
    if (!type || datasets.length === 0) {
      throw Error('type and datasets are mandatory: plot(type, datasets)');
    }
    // if array squeeze it
    datasets = datasets.map(o => Array.isArray(o) ? ({
      data: math.squeeze(o)
    }) : o);
    // convert mathjs objects to array
    datasets = datasets.map(o => {
      if (typeof o === 'object' && Array.isArray(o) === false) {
        return Object.keys(o).reduce((p, c) => {
          if (math.typeof(o[c]) === 'Matrix') {
            p[c] = math.squeeze(o[c])._data || math.squeeze(o[c]);
          }
          else {
            p[c] = o[c];
          }
          return p;
        }, {});
      }
      return o;
    });
    // if datasets is an array of numbers
    if (typeof datasets[0] === 'number') {
      datasets = [{
        data: datasets
      }];
    }
    labels = math.squeeze(labels);
    if (labels.length === 0) {
      labels = datasets[0].data.map((o, i) => o.x ? o.x : (type === 'line' ? i : i + 1));
    }

    return 'chartjs://' + JSON.stringify({
      type,
      data: {
        labels: math.squeeze(labels),
        datasets
      },
      options
    });
  }
}, {
  wrap: true
});


var parser = math.parser();

window.addEventListener('message', e => {
  if (e.data.method === 'evaluate') {
    const results = [];
    const types = [];
    try {
      const r = parser.eval(e.data.code);
      if (r && r.type && r.type === 'ResultSet') {
        r.entries.forEach(r => {
          results.push(math.format(r));
          types.push(math.typeof(r));
        });
      }
      else {
        results.push(r ? math.format(r) : '');
        types.push(math.typeof(r));
      }
    }
    catch(e) {
      console.error(e);
      results.push(e.message);
      types.push('error');
    }
    window.top.postMessage(Object.assign(e.data, {
      results,
      types,
      method: 'print'
    }), '*');
  }
  else if (e.data.method === 'import') {
    eval(e.data.code);
  }
});
