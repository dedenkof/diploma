'use strict';

const gulp = require('gulp'),
  sass = require('gulp-sass'), // compile SASS (SCSS) into CSS
  browserSync = require('browser-sync'), // livereload
  autoprefixer = require('gulp-autoprefixer'), // automating install vendor prefixes
  rimraf = require('rimraf'), // delete files and directories
  sourcemaps = require('gulp-sourcemaps'), // generation map output files
  concat = require('gulp-concat'), // concating many files into one
  plumber = require('gulp-plumber'), // track error
  notify = require('gulp-notify'), // notify message
  gcmq = require('gulp-group-css-media-queries'), // group media queries into one group
  cleanCSS = require('gulp-clean-css'), // minify CSS
  cache = require('gulp-cache'), // cached
  minJS = require('gulp-uglify'), // minify JS
  replace = require('gulp-replace'),
  htmlmin = require('gulp-htmlmin'), // minify HTML
  rename = require('gulp-rename'),
  realFavicon = require ('gulp-real-favicon'), // generation favicon pack
  fs = require('fs'),
  includeFiles = require('gulp-rigger'), // import content one file into other file
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  gifsicle = require('imagemin-gifsicle'), // compress gif
  jpegtran = require('imagemin-jpegtran'), // compress jpeg
  optipng = require('imagemin-optipng'); // compress png


// Config autoprefixer add prefix to the browsers
const autoprefixerList = [
  'Chrome >= 45',
  'Firefox ESR',
  'Edge >= 12',
  'Explorer >= 10',
  'iOS >= 9',
  'Safari >= 9',
  'Android >= 4.4',
  'Opera >= 30'
];

// browserSync config
const config = {
  server: {
    baseDir: "app"
  },
  notify: false,
  //open: false,
  //online: false, // work offline without internet connection
  //tunnel: false, tunnel: "projectName",  demonstration http://projectname.localtunnel.me
  // startPath: 'index.html',
  host: 'localhost',
  port: 9000,
  //proxy: "yourlocal.dev",
  logPrefix: "Frontend_History_Action"
};

// Notify error
const onError = function(err) {
  notify.onError({
    title: 'Error in ' + err.plugin,
  })(err);
  this.emit('end');
};


// Deploy html files (rigger template from ./tempalte )
gulp.task('html', () =>
  gulp.src('app/*.html')
    .pipe(plumber({ errorHandler: onError }))
    //.pipe(includeFiles())
    //.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
    /*.pipe(htmlmin({
     collapseWhitespace: true,
     removeComments: false
     }))*/
    //.pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(gulp.dest('dist/'))
    .on('end', browserSync.reload)
);



// Deploy css via sass preprocessor
gulp.task('sass', () =>
  gulp.src('app/sass/**/*.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}))
    //.pipe(autoprefixer({ browsers: autoprefixerList, cascade: false}))
    // .pipe(gcmq())
    //.pipe(concat('main.css'))
    //.pipe(rename({suffix: '.min'}))
    //.pipe(cleanCSS({level: 2}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))

);

// Copy all generated img files into build directory
gulp.task('images', () =>
  gulp.src('app/img/**/*.{png,xml,jpg,gif,svg,ico,webmanifest}')
    .pipe(cache(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 8}),
        imagemin.svgo({
          plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
          ]
        })
      ],{
        verbose: true // output status treatment img files
      }
    )))
    .pipe(gulp.dest('dist/img/'))
    .pipe(browserSync.reload({
      stream: true
    }))
);

// reload after change via browserSync
gulp.task('browserSync', () =>
    browserSync(config)
);

// delete build dir
// delete build dir
gulp.task('clean', (cb) =>
  rimraf('dist', cb)
);

// clear cashe images
gulp.task('clearCache', () =>
  cache.clearAll()
);

// Build Production Site
gulp.task('buildDist', (done) => {
  const buildcss = gulp.src(['app/css/**/*.css'])
    .pipe(gulp.dest('dist/css'));


  /*const buildJs = gulp.src('app/js/!**!/!*.js')
    .pipe(gulp.dest('dist/js'));

  const buildData = gulp.src('app/data/!**!/!*')
    .pipe(gulp.dest('dist/data'));

  const buildImages = gulp.src('app/images/!**!/!*')
    .pipe(gulp.dest('dist/images'));*/

  const buildImages = gulp.src('src/img/**/*.*')
    .pipe(gulp.dest('dist/img'));
  done();
});

gulp.task('watch', () => {
  // STYLES, SCRIPTS, HTML, IMAGES, FONTS
  gulp.watch('app/sass/**/*.scss', gulp.parallel('sass'));
  gulp.watch('app/*.html', gulp.parallel('html'));
  gulp.watch('src/img/**/*.*', gulp.series('images'));

});

/*-- MANUALLY RUN TASK --*/
// ['clean', 'validation', 'cssLint', 'clearCache', 'check-for-favicon-update']


// Build Production Site with all updates
gulp.task('build', gulp.series(['clean', gulp.parallel('html', 'sass', 'images', 'buildDist')]));

gulp.task('default', gulp.series(['build', gulp.parallel('watch', 'browserSync')]));