const gulp = require("gulp");
const babel = require("gulp-babel");
var uglify = require('gulp-uglify');
var concat = require("gulp-concat");
var cssMin = require("gulp-css");
const htmlmin = require('gulp-htmlmin');
var rename = require("gulp-rename");

gulp.task('views', async function(){
    gulp.src([`./0/public-interface/views/*.ejs`])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename(function (path) {
        path.dirname = "";
        path.basename;
        path.extname = ".ejs";
    }))
    .pipe(gulp.dest('./views'));
    gulp.src([`./0/public-interface/views/partials/*.ejs`])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename(function (path) {
        path.dirname = "partials";
        path.basename;
        path.extname = ".ejs";
    }))
    .pipe(gulp.dest('./views'));

    gulp.src([`./0/public-interface/**/*.html`])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename(function (path) {
        path.dirname = "partials";
        path.basename;
        path.extname = ".html";
    }))
    .pipe(gulp.dest('./views'));
});
gulp.task('css', ()=>{
    return gulp.src(`./0/public-interface/css/*.css`)
    .pipe(rename(function (path) {
        path.dirname = "stylesheets";
        path.basename = path.basename+="-min";;
        path.extname = ".css";
        }))
    .pipe(cssMin())
    .pipe(gulp.dest('./public/'));
}); 
gulp.task('js',()=>{
    return gulp.src('./0/public-interface/js/*.js')
    .pipe(babel({ presets:['@babel/env']}))
    .pipe(rename(function (path) {
        path.dirname = "javascripts";
        path.basename = path.basename+="-min";;
        path.extname = ".js";
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./public/'));

});
/* -------------------------------------------- */
gulp.task('admins', async function(){
    gulp.src([`./0/admins/views/*.ejs`])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename(function (path) {
        path.dirname = "";
        path.basename;
        path.extname = ".ejs";
    }))
    .pipe(gulp.dest('./views'));

    gulp.src([`./0/admins/**/*.html`])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename(function (path) {
        path.dirname = "partials";
        path.basename;
        path.extname = ".html";
    }))
    .pipe(gulp.dest('./views'));
/*  */
    gulp.src('./0/admins/js/padrao/*.js')
    .pipe(concat('admins.js'))
    .pipe(rename(function (path) {
        path.dirname = "javascripts";
        path.basename = path.basename+="-min";;
        path.extname = ".js";
    }))
    .pipe(gulp.dest('./public/'));
    gulp.src('./0/admins/js/*.js')
    .pipe(rename(function (path) {
        path.dirname = "javascripts";
        path.basename = path.basename+="-min";;
        path.extname = ".js";
    }))
    .pipe(gulp.dest('./public/'));



    /*  */
     gulp.src(`./0/admins/css/padrao/*.css`)
     .pipe(concat('admins.css'))
    .pipe(rename(function (path) {
        path.dirname = "stylesheets";
        path.basename = path.basename+="-min";;
        path.extname = ".css";
        }))
    .pipe(cssMin())
    .pipe(gulp.dest('./public/'));

    gulp.src(`./0/admins/css/*.css`)
    .pipe(rename(function (path) {
        path.dirname = "stylesheets";
        path.basename = path.basename+="-min";;
        path.extname = ".css";
        }))
    .pipe(cssMin())
    .pipe(gulp.dest('./public/'));
  

});

/* -------------------------- */
gulp.task('standard-css', ()=>{
    return gulp.src(`./0/project-standard-stylesheet.css`)
    .pipe(rename(function (path) {
        path.dirname = "vendor";
        path.basename = path.basename+="-min";;
        path.extname = ".css";
        }))
    .pipe(cssMin())
    .pipe(gulp.dest('./public/'));
}); //<---------------------------------------------------------------------STANDARD

gulp.task("init",gulp.series("views","css","js","admins"));

    
gulp.task('watch',function(){
    gulp.watch('./0/admins/**/*.*', gulp.series('admins'))
    gulp.watch('./0/public-interface/**/*.html', gulp.series('views'))
    gulp.watch('./0/public-interface/**/*.ejs', gulp.series('views'))
    gulp.watch('./0/public-interface/**/*.css', gulp.series('css'))
    gulp.watch('./0/public-interface/**/*.js', gulp.series('js'))
    gulp.watch('./0/project-standard-stylesheet.css', gulp.series('standard-css'))
})
gulp.task('default',gulp.series("init","watch"));