const gulp = require('gulp');
const babel = require("gulp-babel");
const changed = require('gulp-changed');

const TPL_SRC = 'src/templates/**/*.html';
const TPL_DEST = 'dist/templates';

const CSS_SRC = 'src/styles/**/*.css';
const CSS_DEST = 'dist/styles';

const JS_SRC = 'src/scripts/**/*.js';
const JS_DEST = 'dist/scripts';

const VENDORS_SRC = 'src/vendors/**/*';
const VENDORS_DEST = 'dist/vendors';


gulp.task('tpl', function () {
  return gulp.src(TPL_SRC)
    .pipe(changed(TPL_DEST))
    .pipe(gulp.dest(TPL_DEST));
});

gulp.task('css', function () {
  return gulp.src(CSS_SRC)
    .pipe(changed(CSS_DEST))
    .pipe(gulp.dest(CSS_DEST));
});

gulp.task('vendors', function () {
  return gulp.src(VENDORS_SRC)
    .pipe(changed(VENDORS_DEST))
    .pipe(gulp.dest(VENDORS_DEST));
});

gulp.task('js', function () {
  return gulp.src(JS_SRC)
    .pipe(changed(JS_DEST))
    .pipe(babel())
    .pipe(gulp.dest(JS_DEST));
});

gulp.task('build', ['tpl', 'css', 'js', 'vendors']);

gulp.task('default', function () {
  gulp.watch(JS_SRC, ['js']);
  gulp.watch(CSS_SRC, ['css']);
  gulp.watch(TPL_SRC, ['tpl']);
  gulp.watch(VENDORS_SRC, ['vendors']);
});
