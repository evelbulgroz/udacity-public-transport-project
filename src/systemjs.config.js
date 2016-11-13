/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({
    paths: {
      // paths serve as alias
      'npm:': '../node_modules/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is in the source folder
        app: '',

      // angular bundles
        '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
        '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
        '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
        '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
        '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
        '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
        '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
        '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      
      // angular testing umd bundles
        '@angular/common/testing': 'npm:@angular/common/bundles/common-testing.umd.js',
        '@angular/compiler/testing': 'npm:@angular/compiler/bundles/compiler-testing.umd.js',
        '@angular/core/testing': 'npm:@angular/core/bundles/core-testing.umd.js',
        '@angular/platform-browser/testing': 'npm:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
        '@angular/platform-browser-dynamic/testing': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
        '@angular/http/testing': 'npm:@angular/http/bundles/http-testing.umd.js',
        '@angular/router/testing': 'npm:@angular/router/bundles/router-testing.umd.js',
        '@angular/forms/testing': 'npm:@angular/forms/bundles/forms-testing.umd.js',

      // other angular libraries
        'angular2-in-memory-web-api': 'npm:angular2-in-memory-web-api',
        'rxjs': 'npm:rxjs',

      // other vendor libraries
        '@angular2-material/core': 'npm:@angular2-material/core/core.umd.js',
        '@angular2-material/input': 'npm:@angular2-material/input/input.umd.js',
        '@angular2-material/list': 'npm:@angular2-material/list/list.umd.js',
        '@vaadin':'npm:@vaadin',
        'traceur': '../',
        'lodash': 'npm:lodash',
        'moment': 'npm:moment',
        'moment-timezone': 'npm:moment-timezone'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {main: 'main.js', defaultExtension: 'js'},

      '@vaadin/angular2-polymer': { main: 'index.js', defaultExtension: 'js' },
      'angular2-in-memory-web-api': {defaultExtension: 'js'},
      rxjs: {defaultExtension: 'js'},
      
      'lodash': {main: 'lodash.js', defaultExtension: 'js'},
      'moment': {main: 'moment.js', defaultExtension: 'js'},
      'moment-timezone': {main: 'builds/moment-timezone-with-data.js', defaultExtension: 'js'}
    }
  });
})(this);
