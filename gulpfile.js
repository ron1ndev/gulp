const {src,dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');


	// // Подключаем модуль gulp-clean-css
  // const cleancss = require('gulp-clean-css');
 
  // Подключаем compress-images для работы с изображениями
  const imagecomp = require('compress-images');



  async function images() {
    await imagecomp(
      "app/img/src/**/*", // Берём все изображения из папки источника
      "app/img/dest/", // Выгружаем оптимизированные изображения в папку назначения
      { compress_force: false, statistic: true, autoupdate: true }, false, // Настраиваем основные параметры
      { jpg: { engine: "mozjpeg", command: ["-quality", "75"] } }, // Сжимаем и оптимизируем изображеня
      { png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
      { svg: { engine: "svgo", command: "--multipass" } },
      { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
      function (err, completed) { // Обновляем страницу по завершению
        if (completed === true) {
          browserSync.reload()
        }
      }
    )
  }

function scripts(){
  return src('app/js/main.js',)
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream());
}

function styles(){

  // Создаем не минифицированный файл
  src(['app/scss/style.scss'])
    .pipe(scss({ outputStyle: 'expanded' }))
    .pipe(concat('style.css'))               // Создаст единый style.css
    .pipe(dest('app/css'))                   
    .pipe(browserSync.stream());

  // Создаем минифицированный файл
  return src(['app/scss/style.scss'])
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))           // Создаст единый style.min.css
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
  
}

function watching(){
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/**/*.js','!app/**/*.min.js'],scripts)
  watch(['app/*.html']).on('change', browserSync.reload)
  watch('app/img/src/**/*', images)
}

function browsersync(){
  browserSync.init({
    server: {
        baseDir: "app/",
        notify: false, // Отключаем уведомления
        online: true // Режим работы: true или false
    }
});
}

function cleanDist (){
  return src('dist')
  .pipe(clean());
}

function cleanimg() {
	return src('app/img/dest/', {allowEmpty: true}).pipe(clean()) // Удаляем папку "app/images/dest/"
}

function building(){
  return src([
    'app/css/style.min.css',
    'app/css/style.css',
    'app/js/main.min.js',
    'app/img/dest/**/*',
    'app/*.html'
  ],{base:'app'})
  .pipe(dest('dist'))
}

exports.cleanimg = cleanimg;
exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;

exports.build = series(cleanDist,images,building)
exports.default = parallel(styles,scripts,browsersync,watching,series(cleanimg,images));