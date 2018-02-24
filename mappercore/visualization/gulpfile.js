const gulp = require('gulp');
const babel = require("gulp-babel");
const changed = require('gulp-changed');
const log = require('fancy-log');
const less = require('gulp-less');
const path = require('path');
const concat = require('gulp-concat');
const cssmin = require('gulp-cssmin');

const TPL_SRC = 'src/templates/**/*.html';
const TPL_DEST = 'dist/templates';

const JS_SRC = 'src/scripts/**/*.js';
const JS_DEST = 'dist/scripts';

const VENDORS_SRC = 'src/vendors/**/*';
const VENDORS_DEST = 'dist/vendors';

gulp.task('tpl', function () {
  return gulp.src(TPL_SRC)
    .on('error', log)
    .pipe(changed(TPL_DEST))
    .pipe(gulp.dest(TPL_DEST));
});

gulp.task('less', function () {
  return gulp.src('src/styles/**/*.less')
    .on('error', log)
    .pipe(less())
    .pipe(concat('bundled.css'))
    .pipe(cssmin())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('vendors', function () {
  return gulp.src(VENDORS_SRC)
    .on('error', log)
    .pipe(changed(VENDORS_DEST))
    .pipe(gulp.dest(VENDORS_DEST));
});

gulp.task('js', function () {
  return gulp.src(JS_SRC)
    .on('error', log)
    .pipe(changed(JS_DEST))
    .pipe(babel())
    .pipe(gulp.dest(JS_DEST));
});

gulp.task('build', ['tpl', 'css', 'js', 'vendors']);

gulp.task('default', function () {
  gulp.watch(JS_SRC, ['js']);
  gulp.watch('src/styles/**/*.less', ['less']);
  gulp.watch(TPL_SRC, ['tpl']);
  gulp.watch(VENDORS_SRC, ['vendors']);
});
