'use strict';

var gulp = require('gulp'),
  watch = require('gulp-watch'),
  prefixer = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber');

const BROWSER_SYNC_RELOAD_DELAY = 500,
  PROXY_SERVER_PORT = 5000,
  LIVERELOAD_PORT = 4000;

var path = {
  html: 'src/**/*.html',
  js: 'src/**/*.js',
  css: 'src/css',
  sass: 'src/sass/*.scss'
};


gulp.task('style:build', function () {
    gulp.src(path.sass)
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass())
        .pipe(prefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.css))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('watch_sass', function() {
  watch([path.sass], function (event, cb) {
    try {
      gulp.start('style:build');
    }
    catch(err) {
      console.log(err);
    }
  });
});


gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
    script: 'app.js',
    watch: ['app.js']
  })
    .on('start', function onStart() {
      if (!called) { cb(); }
      called = true;
    })
    .on('restart', function onRestart() {
      setTimeout(function reload() {
        browserSync.reload({
          stream: false
        });
      }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

gulp.task('browser-sync', ['nodemon'], function () {
  browserSync({
    proxy: `http://localhost:${PROXY_SERVER_PORT}`,
    port: LIVERELOAD_PORT,
    browser: ['google-chrome']
  });
  browserSync.reload({
    stream: false
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('default', ['browser-sync', 'watch_sass', 'style:build'], function () {
  gulp.watch(path.js,   ['bs-reload']);
  gulp.watch(path.html, ['bs-reload']);
});
