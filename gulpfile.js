const gulp = require('gulp');
const babel = require('gulp-babel');
const electron = require('electron-connect').server.create();

gulp.task('compile', function(){
  return gulp.src('src/**/*.{js,jsx}')
    .pipe(babel({
            presets: ["es2015", "react"]
        }))
    .pipe(gulp.dest('app/js'));
});

gulp.task('start', ['compile'], function(){
  electron.start();
  gulp.watch('src/**/*.{js,jsx}', ['compile']);
  gulp.watch(['main.js'], electron.restart);
  gulp.watch(['index.html', 'app/**/*.{html,js,css}'], electron.reload);
});
