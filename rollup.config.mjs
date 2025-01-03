import copy from 'rollup-plugin-copy';

export default [
  {
    input: 'options.js',
    plugins: [
      copy({
        targets: [
          { src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js', dest: 'lib' },
          { src: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map', dest: 'lib' },
          { src: 'node_modules/milligram/dist/milligram.min.css', dest: 'lib' },
          { src: 'node_modules/milligram/dist/milligram.min.css.map', dest: 'lib' }
        ]
      })
    ]
  }
];