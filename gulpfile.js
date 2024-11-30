// Импортируем необходимые модули из Gulp
const {src, dest, watch, parallel, series} = require('gulp');

// Подключаем модули для обработки SCSS, объединения файлов, минификации и прочее
const scss = require('gulp-sass')(require('sass'));  // Компиляция SCSS в CSS
const concat = require('gulp-concat');  // Объединение файлов в один
const uglify = require('gulp-uglify-es').default;  // Минификация JavaScript
const browserSync = require('browser-sync').create();  // Локальный сервер с автоперезагрузкой
const clean = require('gulp-clean');  // Удаление файлов или папок
const fileinclude = require('gulp-file-include');  // Инклюды для HTML

// Функция для обработки HTML с инклудов
function htmlInclude() {
  return src('app/html/*.html')  // Обрабатываем только конечные HTML файлы
    .pipe(
      fileinclude({
        prefix: '@@',            // Префикс для инклудов
        basepath: '@file',       // Путь для поиска инклудов
      })
    )
    .pipe(dest('app'))           // Сохраняем итоговые файлы в корень app
    .pipe(browserSync.stream()); // Автоперезагрузка страницы
}

// Функция для обработки JavaScript
function scripts() {
  return src('app/js/main.js')  // Берем основной файл JS
    .pipe(concat('main.min.js'))  // Объединяем все JS файлы в один main.min.js
    .pipe(uglify())  // Минифицируем JS код
    .pipe(dest('app/js'))  // Сохраняем в папку app/js
    .pipe(browserSync.stream());  // Автоперезагрузка страницы при изменениях
}

// Функция для обработки SCSS
function styles() {
  // Создание не минифицированного CSS
  src(['app/scss/style.scss'])
    .pipe(scss({ outputStyle: 'expanded' }))  // Компиляция SCSS в обычный CSS
    .pipe(concat('style.css'))  // Объединение всех файлов в один style.css
    .pipe(dest('app/css'))  // Сохраняем в папку app/css
    .pipe(browserSync.stream());  // Автоперезагрузка страницы при изменениях

  // Создание минифицированного CSS
  return src(['app/scss/style.scss'])
    .pipe(scss({ outputStyle: 'compressed' }))  // Компиляция SCSS в минифицированный CSS
    .pipe(concat('style.min.css'))  // Объединение всех файлов в один style.min.css
    .pipe(dest('app/css'))  // Сохраняем в папку app/css
    .pipe(browserSync.stream());  // Автоперезагрузка страницы при изменениях
}

// Функция для отслеживания изменений в файлах
function watching() {
  watch(['app/scss/**/*.scss'], styles);  // Отслеживаем изменения SCSS файлов
  watch(['app/**/*.js', '!app/**/*.min.js'], scripts);  // Отслеживаем изменения JS файлов
  watch(['app/html/**/*.html'], htmlInclude);  // Отслеживаем изменения всех HTML файлов
  watch(['app/*.html']).on('change', browserSync.reload);  // Автоперезагрузка страницы при изменении HTML
}

// Функция для настройки локального сервера
function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/",  // Базовая директория для сервера
      notify: false,  // Отключаем уведомления
      online: true,  // Включаем онлайн-режим
    }
  });
}

// Функция для очистки папки dist
function cleanDist() {
  return src('docs')  // Удаляем все содержимое папки docs
    .pipe(clean());
}

// Функция для копирования изображений в папку docs
function copyImages() {
  return src('app/img/**/*', {encoding: false})  // Берем все изображения из папки app/img
    .pipe(dest('docs/img'));  // Копируем изображения в папку docs/img
}

// Функция для сборки проекта в папку docs
function building() {
  return src([
    'app/css/style.min.css',  // Минифицированный CSS
    'app/css/style.css',      // Обычный CSS
    'app/js/main.min.js',     // Минифицированный JS
    'app/*.html',             // Только файлы в корне папки app
    '!app/html/**',           // Исключаем всю папку html, включая includes
    '!app/html/includes/**',  // Дополнительно исключаем папку includes
  ], {base: 'app'})
    .pipe(dest('docs'));       // Копируем файлы в папку docs
}

// Экспортируем задачи
exports.styles = styles;  // Задача для обработки стилей
exports.scripts = scripts;  // Задача для обработки JavaScript
exports.watching = watching;  // Задача для отслеживания изменений
exports.browsersync = browsersync;  // Задача для настройки локального сервера
exports.htmlInclude = htmlInclude;  // Задача для обработки инклудов в HTML

// Задача для сборки проекта
exports.build = series(cleanDist, parallel(building, copyImages));  // Очищаем папку и выполняем сборку

// Задача по умолчанию, которая запускает проект
exports.default = parallel(styles, scripts, browsersync, watching, htmlInclude);  // Запуск всех задач
