// VARIABLES

let preprocessor = 'scss',
  fileswatch = 'htm,txt,md,woff2,woff', // html,json
  imageswatch = 'jpg,jpeg,png,webp,svg,gif,ico',
  online = true,
  project_folder = 'app', // require("path").basename(__dirname)
  baseDir = 'src',
  mode = 'concat'; // webpack | concat


// LOGIC

import pkg from 'gulp';
const { gulp, src, dest, parallel, series, watch } = pkg;

import browserSync   from 'browser-sync';
import gulpif        from 'gulp-if';
import rename        from 'gulp-rename';
import del           from 'del';
import rsync         from 'gulp-rsync';

import uglifyEs      from 'gulp-uglify-es';
const  uglify        = uglifyEs.default;

import gulpSass      from 'gulp-sass';
import dartSass      from 'sass';
const  sass          = gulpSass(dartSass);
const  scss          = gulpSass(dartSass);
import postCss       from 'gulp-postcss';
import groupMedia    from 'postcss-sort-media-queries';
import autoprefixer  from 'autoprefixer';
import cssnano       from 'cssnano';
import webpcss       from 'postcss-webp';

import htmlmin       from 'gulp-htmlmin';
import imagemin      from 'gulp-imagemin';
import changed       from 'gulp-changed';
import webp          from 'gulp-webp';

import ttf2woff      from 'gulp-ttf2woff';
import ttf2woff2     from 'gulp-ttf2woff2';

import notify        from 'gulp-notify';
import fileinclude   from 'gulp-file-include';
import fs            from 'fs';

import rev           from 'gulp-rev';
import revRewrite    from 'gulp-rev-rewrite';
import revDel        from 'gulp-rev-delete-original';

import webpackStream from 'webpack-stream';
import webpack       from 'webpack';
import TerserPlugin  from 'terser-webpack-plugin';


// DEVELOPMENT VARIABLES

const isProd = process.argv.includes('--prod'); // включает cssnano, uglify, htmlmin
const isDev = !isProd; // отключает cssnano, uglify, htmlmin
const isWebp = process.argv.includes('--webp'); // включает конвертацию графики в webp
console.log('production mode: ', isProd);
console.log('development mode: ', isDev);
console.log('image conversion mode: ', isWebp);
console.log('scripts mode: ', mode);

// FUNCTIONS

async function clean() {
  return del([`${project_folder}/*`], { force: true });
}

function browsersync() {
  browserSync.init({
    // proxy: 'test', // Раскоментировать, если нужно обновление PHP файлов
    server: { // Закоментировать, если нужно обновление PHP файлов
      baseDir: project_folder + '/',
    },
    ghostMode: { clicks: false },
    // port: 3000,
    notify: false,
    online: online,
    open: false,
    // tunnel: 'yousitename', // Attempt to use the URL http://yousitename.loca.lt
  });
}

function html() {
  return src(baseDir + '/*.html')

    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }).on("error", notify.onError()))


    .pipe(gulpif(isProd,
      htmlmin({
        collapseWhitespace: true
      })
    ))

    .pipe(dest(project_folder + '/'))
    .pipe(browserSync.stream());
}

function styles() {
  let func;
  if (!isWebp && !isProd) {
    func = postCss([
      autoprefixer({
        grid: 'autoplace',
        cascade: false
      }),
    ]);
  } else if (isWebp && isProd) {
    func = postCss([
      autoprefixer({
        grid: 'autoplace',
        cascade: false
      }),
      webpcss({
        webpClass: "_webp"
      }),
      cssnano({
        preset: ['default', {
          discardComments: { removeAll: true } // Удалить все комментарии
        }]
      })
    ]);
  } else if (isProd) {
    func = postCss([
      autoprefixer({
        grid: 'autoplace',
        cascade: false
      }),
      cssnano({
        preset: ['default', {
          discardComments: { removeAll: true } // Удалить все комментарии
        }]
      })
    ]);
  } else {
    func = postCss([
      autoprefixer({
        grid: 'autoplace',
        cascade: false
      }),
      webpcss({
        webpClass: "_webp"
      })
    ]);
  }

  return src([`${baseDir}/${preprocessor}/main.*`, `${baseDir}/${preprocessor}/some.*`])
    // .pipe(eval(preprocessor)({ 'include css': true }).on('error', sass.logError))
    .pipe(eval(preprocessor).sync({ 'include css': true }).on('error', sass.logError))

    // .pipe(gulpif(isProd, dest(`${project_folder}/css`)))

    .pipe(func)

    .pipe(rename({
      suffix: ".min",
      extname: '.css'
    }))
    .pipe(dest(`${project_folder}/css/`))
    .pipe(browserSync.stream());
}

// JavaScript Vendors
function scripts_vendors() {
  return src(`${baseDir}/js/vendor.js`)
    .pipe(fileinclude())
    // .pipe(gulpif(isProd, dest(`${project_folder}/js`)))
    .pipe(gulpif(isProd, uglify().on("error", notify.onError())))
    .pipe(rename({
      suffix: ".min",
      extname: '.js'
    }))
    .pipe(dest(`${project_folder}/js`))
    .pipe(browserSync.stream());
}

// For JavaScript Concat mode
function scripts_concat() {
  return src([`${baseDir}/js/main.js`])
    .pipe(fileinclude())
    // .pipe(gulpif(isProd, dest(`${project_folder}/js`)))
    .pipe(gulpif(isProd, uglify().on("error", notify.onError())))
    .pipe(rename({
      suffix: ".min",
      extname: '.js'
    }))
    .pipe(dest(`${project_folder}/js`))
    .pipe(browserSync.stream());
}

// For JavaScript Webpack mode
function scripts_webpack() {
  let mode = 'development';
  let minimize = false;

  if (isProd) {
    mode = 'production';
    minimize = true;
  }

  return src([`${baseDir}/js/main.js`])
    .pipe(webpackStream({
      mode: mode, // 'production' / 'development'
      performance: { hints: false },
      // plugins: [
      //   new webpack.ProvidePlugin({
      //     $: 'jquery',
      //     jQuery: 'jquery',
      //     'window.jQuery': 'jquery'
      //   }), // jQuery (npm i jquery)
      // ],
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ['babel-plugin-root-import']
              }
            }
          }
        ]
      },
      optimization: {
        minimize: minimize,
        minimizer: [
          new TerserPlugin({
            terserOptions: { format: { comments: false } },
            extractComments: false
          })
        ]
      },
    }, webpack)).on('error', function handleError() {
      this.emit('end');
    })

    .pipe(rename('main.min.js'))
    .pipe(dest(`${project_folder}/js`))
    .pipe(browserSync.stream());
}

function images() {
  return src(`${baseDir}/img/**/*.{${imageswatch}}`)

    .pipe(gulpif(isWebp, changed(`${project_folder}/img`)))
    .pipe(gulpif(isWebp, webp({
      quality: 75
    })))
    .pipe(gulpif(isWebp, dest(`${project_folder}/img`)))

    .pipe(src(`${baseDir}/img/**/*.{${imageswatch}}`))
    .pipe(changed(`${project_folder}/img`))
    // .pipe(gulpif(isProd, imagemin()))
    .pipe(imagemin())
    .pipe(dest(`${project_folder}/img`));
}

function resources() {
  return src(`${baseDir}/resources/**`)
    .pipe(dest(`${project_folder}/`));
}

function json() {
  return src(baseDir + '/json/*.*')
    .pipe(dest(project_folder + '/json/'))
    .pipe(browserSync.stream());
}

function cleanimg() {
  return del(`${project_folder}/img/**/*`, { force: true });
}

function fonts() {
  // Перенос woff/woff2 в папку bild
  src(`${baseDir}/fonts/*.{woff,woff2}`)
    .pipe(dest(`${project_folder}/fonts/`));

  src(`${baseDir}/fonts/icons.{woff,woff2}`)
    .pipe(dest(`${project_folder}/fonts/`));

  src(`${baseDir}/fonts/*.ttf`)
    .pipe(ttf2woff())
    .pipe(dest(`${project_folder}/fonts/`));

  return src(`${baseDir}/fonts/*.ttf`)
    .pipe(ttf2woff2())
    .pipe(dest(`${project_folder}/fonts/`))
    .pipe(browserSync.stream());
}

function checkWeight(fontname) {
  let weight = 400;
  switch (true) {
    case /Thin/.test(fontname):
      weight = 100;
      break;
    case /ExtraLight/.test(fontname):
      weight = 200;
      break;
    case /Light/.test(fontname):
      weight = 300;
      break;
    case /Regular/.test(fontname):
      weight = 400;
      break;
    case /Medium/.test(fontname):
      weight = 500;
      break;
    case /SemiBold/.test(fontname):
      weight = 600;
      break;
    case /Semi/.test(fontname):
      weight = 600;
      break;
    case /Bold/.test(fontname):
      weight = 700;
      break;
    case /ExtraBold/.test(fontname):
      weight = 800;
      break;
    case /Heavy/.test(fontname):
      weight = 700;
      break;
    case /Black/.test(fontname):
      weight = 900;
      break;
    default:
      weight = 400;
  }
  return weight;
}

async function fontsStyle() {
  let file_content = fs.readFileSync(`${baseDir}/${preprocessor}/_fonts.${preprocessor}`);

  if (file_content == '') {
    fs.writeFile(`${baseDir}/${preprocessor}/_fonts.${preprocessor}`, '', cb);

    return fs.readdir(`${project_folder}/fonts/`, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];

          let font = fontname.split('-')[0];
          let weight = checkWeight(fontname);

          if (c_fontname != fontname) {
            fs.appendFile(`${baseDir}/${preprocessor}/_fonts.${preprocessor}`, '@include font("' + font + '", "' + fontname + '", ' + weight + ', "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    });
  }
}
function cb() { }

const startwatch = () => {
  watch(`${baseDir}/${preprocessor}/**/*`, { usePolling: true }, styles);

  watch([`${baseDir}/js/**/*.js`, `!${baseDir}/js/vendor.js`, `!${baseDir}/js/vendor/**/*.js`], { usePolling: true }, scripts);
  watch([`${baseDir}/js/vendor.js`, `${baseDir}/js/vendor/**/*.js`], { usePolling: true }, scripts_vendors);

  watch(`${baseDir}/**/*.{${imageswatch}}`, { usePolling: true }, images);

  watch(`${baseDir}/resources/**`, { usePolling: true }, resources);

  watch(`${baseDir}/**/*.html`, { usePolling: true }, html);

  watch(`${baseDir}/json/*.json`, { usePolling: true }, json);

  watch(`${baseDir}/**/*.{${fileswatch}}`, { usePolling: true },).on('change', browserSync.reload);
};

// DEPLOY rsync
function deploy() {
  return src(project_folder + '/')
    .pipe(rsync({
      root: project_folder + '/',
      hostname: 'aj73303qw@alshvets.ru', // Deploy hostname
      destination: 'sups_alshvets_ru/public_html/', // Deploy destination 'site/public_html/'
      // clean: true, // Mirror copy with file deletion
      include: [/* '*.htaccess' */], // Included files to deploy
      exclude: [ // Excluded files from deploy
        '**/Thumbs.db',
        '**/*.DS_Store',
      ],
      recursive: true,
      archive: true,
      silent: false,
      compress: true
    }));
}

// Backend
function stylesBackend() {
  return src(`${baseDir}/${preprocessor}/**/*.*`)
    .pipe(eval(preprocessor)().on("error", sass.logError))
    .pipe(autoprefixer({
      grid: true, // префиксы GRID Layout для IE 10 - 11
      overrideBrowserslist: ['last 5 versions'],
      cascade: false
    }))
    .pipe(dest(`${project_folder}/css/`));
}

function scriptsBackend() {
  src(`${baseDir}/js/vendor/**.js`)
    .pipe(fileinclude())
    .pipe(uglify().on("error", notify.onError()))
    .pipe(dest(`${project_folder}/js/`));
  return src([`${baseDir}/js/functions/**.js`, `${baseDir}/js/components/**.js`, `${baseDir}/js/main.js`])
    .pipe(dest(`${project_folder}/js`));
}

// Cache
function cache() {
  return src(`${project_folder}/**/*.{css,js,svg,png,jpg,jpeg,woff2}`, {
    base: project_folder})
    .pipe(rev())
    .pipe(revDel())
    .pipe(dest(project_folder))
    .pipe(rev.manifest('rev.json'))
    .pipe(dest(project_folder));
}

function rewrite() {
  const manifest = fs.readFileSync(`${project_folder}/rev.json`);
  src(`${project_folder}/css/*.css`)
    .pipe(revRewrite({
      manifest
    }))
    .pipe(dest(`${project_folder}/css`));
  return src(`${project_folder}/**/*.html`)
    .pipe(revRewrite({
      manifest
    }))
    .pipe(dest(project_folder));
}


let scripts = eval(`scripts_${mode}`);

export { scripts_vendors, deploy, images, cleanimg };
export let fontsStyles = series(fonts, fontsStyle);
export let assets = series(cleanimg, styles, scripts, scripts_vendors, fonts, images, fontsStyle);
export default series(clean, html, scripts, scripts_vendors, styles, images,
  parallel(browsersync, startwatch, resources, json, fonts)
);
export let build = series(clean, html, scripts, scripts_vendors, styles, resources, json, images, fonts);

export let caches = series(cache, rewrite);
export let backend = series(clean, html, scriptsBackend, stylesBackend, resources, json, images);
