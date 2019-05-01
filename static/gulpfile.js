const gulp = require('gulp');
const babel = require("gulp-babel");
const changed = require('gulp-changed');
const less = require('gulp-less');
const cssmin = require('gulp-cssmin');
const browserSync = require('browser-sync').create();
const gulpMultiProcess = require('gulp-multi-process');
const plumber = require('gulp-plumber');
const clean = require('gulp-clean');

const paths = {
  'dist': '../mapper_interactive/static/*',

  'tpl.src': './templates/**/*.html',
  'tpl.dest': '../mapper_interactive/static/templates',

  'js.src': './modules/**/*.js',
  'js.dest': '../mapper_interactive/static/modules',

  'vendor.src': './vendors/**/*',
  'vendor.dest': '../mapper_interactive/static/vendors',

  'less.src': './stylesheets/styles.less',
  'less.dest': '../mapper_interactive/static/stylesheets',

  'icons.src': './stylesheets/icons/*',
  'icons.dest': '../mapper_interactive/static/stylesheets/icons'
};

gulp.task('clean', function () {
  return gulp.src(paths['dist'], {read: false})
    .pipe(clean());
});

gulp.task('tpl:copy', function () {
  return gulp.src(paths['tpl.src'])
    .pipe(plumber())
    .pipe(changed(paths['tpl.dest']))
    .pipe(gulp.dest(paths['tpl.dest']));
});

gulp.task('less:build', function () {
  return gulp.src(paths['less.src'])
    .pipe(plumber())
    .pipe(less({}))
    .pipe(cssmin())
    .pipe(gulp.dest(paths['less.dest']));
});

gulp.task('icons:copy', function () {
  return gulp.src(paths['icons.src'])
    .pipe(plumber())
    .pipe(changed(paths['icons.dest']))
    .pipe(gulp.dest(paths['icons.dest']));
});

gulp.task('vendors:copy', function () {
  return gulp.src(paths['vendor.src'])
    .pipe(plumber())
    .pipe(changed(paths['vendor.dest']))
    .pipe(gulp.dest(paths['vendor.dest']));
});

gulp.task('js:build', function () {
  return gulp.src(paths['js.src'])
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest(paths['js.dest']));
});

gulp.task('build', ['tpl:copy', 'less:build', 'js:build', 'icons:copy', 'vendors:copy']);
gulp.task('dist', ['clean', 'build']);

gulp.task('default', function () {
  browserSync.init({});

  gulp.watch(paths['less.src'], function () {
    gulpMultiProcess(['less:build'], function () {
      browserSync.reload();
    })
  });

  gulp.watch(paths['icons.src'], ['icons:copy']);
  gulp.watch(paths['js.src'], ['js:build']);
  gulp.watch(paths['tpl.src'], ['tpl:copy']);
  gulp.watch(paths['vendor.src'], ['vendors:copy']);
});
