/* Imports */
	let gulp = require('gulp');
	let autoprefixer = require('gulp-autoprefixer');
	let cssnano = require('gulp-cssnano');
	let concat = require('gulp-concat');
	let frep = require('gulp-frep');
	let gulpif = require('gulp-if'); // provides conditional processing of streams
	let htmlmin = require('gulp-htmlmin'); // minimizes html (seems ineffective?)
	let imagemin = require('gulp-imagemin'); //lossless image compression
	//let pngquant = require(imagemin-pngquant); //'smart lossy image compression'
	let modernizr = require('gulp-modernizr'); // browser feature detection
	let sass = require('gulp-sass'); // SASS precompiler
	let sequence = require('gulp-sequence'); // run tasks in controlled sequence, not randomly parallel
	let shell = require('gulp-shell');
	//let sourcemaps = require('gulp-sourcemaps');
	let uglify = require('gulp-uglify'); //minimizes js
	let useref = require('gulp-useref'); // parses js and css build blocks in html source 
	let vulcanize = require('gulp-vulcanize');

/* Scripts */
	let buildDir = 'build';

	// clear out build directory
	gulp.task('clear-build', shell.task([
		'if exist ' + buildDir + ' rmdir ' + buildDir + ' /S /Q'
	]));

	// copy index.html to build, transforming links to external resources
	gulp.task('build-html', () => {
		let patterns = [
			{ // remove individual links to Polymer web components
				pattern: /(<link rel="import"([^>]+)>)/ig,
				replacement: ''
			},
			{ //insert link to bundled (vulcanized) Polymer web components
				pattern: '<link rel="stylesheet" href="./app.css">',
				replacement: '<link rel="stylesheet" href="./app.css"><link rel="import" href="elements.html">'
			}
		]
		gulp.src(['src/index.html'])
			.pipe(useref()) // concatenate build blocks
			.pipe(frep(patterns))
			.pipe(gulpif('*.html', htmlmin({  // minify html
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true,
				removeComments: true,
				removeEmptyAttributes: true
			})))
			.pipe(gulp.dest(buildDir + '/.'))
	});	
	
	// copy minified images to build folder
	gulp.task('build-images', function() {
		gulp.src(['src/images/*.gif', 'src/images/*.jpg', 'src/images/*.png'])
		.pipe(imagemin())
		.pipe(gulp.dest(buildDir + '/images/.'));
	});

	// copy misc. files that need to be moved unchanged to build folder 
	gulp.task('build-misc', function() {
		gulp.src(['src/cache.worker.js', 'src/.htaccess'])
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulp.dest(buildDir));
	});

	// copy concatenated and minified polymer elements resources to build folder
	gulp.task('build-polymer', function() {
		return gulp.src('src/elements.html')
		.pipe(vulcanize({stripComments: true}))
		.pipe(gulpif('*.html', htmlmin({  // minify html (seems not to have much effect)
				collapseWhitespace: true,
				removeComments: true,
				removeEmptyAttributes: true
			})))
		.pipe(gulp.dest(buildDir));
	});

	// copy concatenated and minified css files to build folder
	gulp.task('build-styles', function() {
		gulp.src('src/**/*.css')
		.pipe(concat('app.css'))
		.pipe(cssnano()) // minimize
		.pipe(gulp.dest(buildDir));
	});
	
	// (re-)build custom Modernizr library
	gulp.task('compile-modernizr', function() {
		gulp.src(['src/**/*.js', '!src/lib/modernizr-custom.js'])
		.pipe(modernizr('modernizr-custom.js'))
		.pipe(gulp.dest('src/lib'))
	});

	// (re-)compile sass to css
	gulp.task('compile-sass', function() {
		gulp.src('src/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer({browsers: ['last 2 versions']})) // chokes on '//' comments, so run sass first
		.pipe(cssnano()) // minimize (again)
		.pipe(gulp.dest('src/.'));
	});

	/*
	gulp.task('docs', shell.task([ // create fresh jsDoc (may not work with TypeScript)
		'if exist docs rmdir docs /S /Q',
		'jsdoc src/**//*.js/ -r -d docs Readme.md'
	]));
	*/

	gulp.task('build', sequence(
		'compile-modernizr',
		'compile-sass',
		'clear-build',
		'build-images',
		'build-polymer',
		'build-styles',
		'build-html',
		'build-misc'
	));