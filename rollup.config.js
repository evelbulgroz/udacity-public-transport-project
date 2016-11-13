import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import rollup from 'rollup';
import uglify from 'rollup-plugin-uglify';


export default {
  entry: 'src/main-aot.js', //use AOT optimized code
  dest: 'build/main.js', // output a single application bundle
  sourceMap: false,
  format: 'amd',// 'iife',
  plugins: [
      nodeResolve({jsnext: true, module: true}),
      json(),
      commonjs({ // transpile ES5 modules to ES6 (tried  rollup-plugin-alias, but couldn't get it to work)
        include: [
          'node_modules/rxjs/**',
          'node_modules/@vaadin/angular2-polymer/**',
          'node_modules/moment-timezone/**'
        ]
      }),
      uglify()
  ]
}