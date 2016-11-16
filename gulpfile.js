var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat');
    
    
    
gulp.task('concat', function(){
    
    gulp.src(['src/Game.js', 'src/**/*'])
        .pipe(sourcemaps.init())
        .pipe(concat('bowling.js'))
        .pipe(sourcemaps.write(""))
        .pipe(gulp.dest(''));
    
});


gulp.task('watch', function(){
    
    gulp.watch('src/**/*', ['build']);
    
});

gulp.task('build', ['concat']);


gulp.task('default', ['build', 'watch']);