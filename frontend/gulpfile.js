'use strict';

var
    gulp = require('gulp'),
    watch = require('gulp-watch'), // следим за изменениями файлов
    prefixer = require('gulp-autoprefixer'), // автопрефиксы
    gcmq = require('gulp-group-css-media-queries'), //группирует медиа запросы
    uglify = require('gulp-uglify'), // минификация js
    sass = require('gulp-sass'), // работа с препроцессором SCSS
    csso = require('gulp-csso'), // Минификация CSS-файлов
    sassGlob = require('gulp-sass-glob'), // Импортирует все scss файлы в один
    rimraf = require('rimraf'), //rm -rf для ноды
    rigger = require('gulp-rigger'),
    browserSync = require("browser-sync"), // локальный dev сервер с livereload, так же с его помощью мы сможем сделать тунель на наш localhost
    reload = browserSync.reload;


//Пропишем пути
var path = {
    build: {
        html: '../',
        js: '../js/',
        css: '../',
        img: '../img/',
        fonts: '../fonts/',
        php: '../'
    },
    src: { //исходники
        // pug: '../src/templates/*.pug',
        html: '../src/*.html',
        js: '../src/js/*.js',
        style: '../src/style/style.scss',
        img: ['../src/img/**/*.*', '!../src/img/sprite.svg'],
        fonts: '../src/fonts/**/*.*',
        php: '../src/*.php'
    },
    watch: { //отслеживание
        // pug: '../src/**/*.pug',
        js: '../src/js/**/*.js',
        html: '../src/*.html',
        style: '../src/style/**/*.scss',
        img: '../src/img/**/*.*',
        fonts: '../src/fonts/**/*.*',
        php: '../src/*.php'
    },
    clean: '../build'
};

//Конфигурация сервера
var config = {

    tunnel: false,
    proxy: 'openserver.dev' //Сюда прописываем адрес домена, который создали через опен сервер.
};

//обрабатываем html
gulp.task('html:build', function() {
      gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({ stream: true }));
});

//переносим php
gulp.task('php:build', function() {
      gulp.src(path.src.php)
        .pipe(gulp.dest(path.build.php))
        .pipe(reload({ stream: true }));
});

//обрабатываем js
gulp.task('js:build', function() {
    gulp.src(path.src.js)
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({ stream: true }));
});

// собираем стили
gulp.task('style:build', function() {
    gulp.src(path.src.style)
        .pipe(sassGlob())
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(prefixer({
          browsers: ['last 2 versions'], //версии поддерживаемых браузеров
          cascade: false
        }))
        .pipe(gcmq())
        .pipe(csso())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({ stream: true }));
});

//собираем изображения
gulp.task('image:build', function() {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({ stream: true }));
});

//копируем шрифты
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

//общий build
gulp.task('build', [
    'html:build',
    'php:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

//отслеживание изменений
// gulp.task('watch', function() {
//     watch([path.watch.pug], function(event, cb) {
//         gulp.start('html:build');
//     });
gulp.task('watch', function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.php], function(event, cb) {
        gulp.start('php:build');
    });
});

//сервер
gulp.task('webserver', function() {
    browserSync(config);
});

//очистка
gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
