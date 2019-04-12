var gulp = require('gulp'),
    clean = require('gulp-clean');
livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    cleanCSS = require('gulp-clean-css');
postcssPresetEnv = require('postcss-preset-env'),
    precss = require('precss'),
    stylelint = require('stylelint'),
    minify = require('gulp-minify'),
    config = require('./stylelint.config.js'),
    gutil = require('gutil'),
    reporter = require('postcss-browser-reporter'),
    imagemin = require('gulp-imagemin')


var styleReporter = {
    'selector': 'html:before',
    'styles': {
        'color': '#fff',
        'background': '#FC4E61',
        'position': 'fixed',
        'right': '0',
        'bottom': '0',
        'margin': '15px',
        'padding': '20px',
        'line-height': '1.5em',
        'border-radius': '8px',
        'font-size': '18px',
        'font-family': 'sans-serif',
        'font-weight': '300',
        'z-index': '2000'
    }
}

// server connect
gulp.task('connect', function () {
    connect.server({
        root: '.', //path to project
        livereload: true,
    });
});

// styles
gulp.task('styles', function () {
    var processors = [
        require("postcss-import")(),
        stylelint(config),
        precss,
        reporter(styleReporter),
    ];

    gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/fonts'));
    gulp.src('src/styles/**/*.css').pipe(gulp.dest('dist/styles'));

    return gulp.src('src/styles/main.pcss')
        .pipe(postcss(processors).on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        }))
        .pipe(postcss([postcssPresetEnv({browsers: 'last 2 versions'})]))
        .pipe(rename('style.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/styles'))
        .pipe(connect.reload());
});

// compressor
gulp.task('compressor', function () {
    gulp.src('src/favicon/**/*').pipe(gulp.dest('dist/favicon'));
    gulp.src('src/video/*').pipe(gulp.dest('dist/video'));

    return gulp.src('src/images/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
        }))
        .pipe(gulp.dest('dist/images/'))
        .pipe(connect.reload());
});

// html
gulp.task('html', function () {
    gulp.src('./*.html')
        .pipe(connect.reload());
});

//scripts
gulp.task('scripts', function () {
    return gulp.src('src/scripts/**/*.js')
        .pipe(minify({
            ext: {
                min: '.min.js',
            },
            ignoreFiles: ['*.min.js'],
            noSource: true
        }))
        .pipe(gulp.dest('dist/scripts/'));
});

//clean

gulp.task('clean', function () {
    return gulp.src('dist')
        .pipe(clean());
});

// watch
gulp.task('watch', function () {
    gulp.watch('src/styles/**/*.pcss', ['styles']);
    gulp.watch('src/**/*.js', ['scripts']);
    gulp.watch('./*.html', ['html']);
    gulp.watch('src/img/**/*', ['compressor']);
});

//build (run with clean dist)
gulp.task('build', ['clean', 'styles', 'scripts', 'compressor', 'connect', 'watch']);

//default
gulp.task('default', ['styles', 'scripts', 'compressor', 'connect', 'watch']);
