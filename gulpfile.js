
var gulp = require("gulp");
var scss = require("gulp-scss");
var concat = require("gulp-concat");
var uglify = require("gulp-uglifyjs");
var browserSync= require("browser-sync");
var autoprefixer = require("gulp-autoprefixer");
var del = require("del");
var bower = require("gulp-bower");
var imageMin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");
var babel = require("gulp-babel");
var jimp = require("gulp-jimp-resize");



gulp.task("scripts-libs", function() {
	return gulp.src([
		'src/libs/jsplumb/dist/js/jsplumb.min.js',
		'src/libs/jquery/dist/jquery.min.js',
        'src/libs/jquery-ui/jquery-ui.min.js',

	])
		.pipe(concat('libs.min.js'))
		.pipe(gulp.dest("dist/js"));
});

gulp.task("scripts", [], function() {

	return gulp.src(["src/js/*.js"])
		.pipe(babel({
            presets: ['@babel/env']
        }))
		.pipe(gulp.dest("dist/js"));
	
});

gulp.task("icons", function() {

    return gulp.src('src/icon.png')
        .pipe(jimp({
            sizes: [
                {"suffix": "128", "width": 128},
                {"suffix": "64", "width": 64},
                {"suffix": "48", "width": 48},
                {"suffix": "16", "width": 16}
            ]
        }))
        .pipe(imageMin({
            interlaced: true,
            progressive: true,
            une: [pngquant]
        }))
        .pipe(gulp.dest('dist/icons'));
});


gulp.task("styles-libs", function() {
	return gulp.src([
		//'src/libs/normalize-css/normalize.css',
	])
		.pipe(scss())
		.pipe(concat("libs.min.css"))
		.pipe(gulp.dest("dist/css"))
});

gulp.task("styles", [], function() {
	return gulp.src(["src/css/*.scss"])
		.pipe(scss())
		.pipe(autoprefixer())
		.pipe(gulp.dest("dist/css"))
		.pipe(browserSync.reload({stream: true}))
});


gulp.task("clean", function() {
	return del.sync("dist");
});

gulp.task("build", ['clean', "styles-libs",'styles', 'scripts-libs', 'scripts', "icons"], function() {
	gulp.src("src/html/*.html").pipe(gulp.dest("dist/html"));
	gulp.src("src/manifest.json").pipe(gulp.dest("dist/"));

});


gulp.task("html", function() {
	return gulp.src([
		"src/html/*.html",
	])
		.pipe(gulp.dest("dist/html"))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('bower', function() {
    return bower({ cmd: 'update'})
        .pipe(gulp.dest('vendor/'))
});


gulp.task("browser-sync", function() {
	browserSync({
		server: {
			baseDir: "src"
		}
	})
});

gulp.task("watch", ['html', 'browser-sync', 'styles'], function() {
	gulp.watch('src/css/*.scss', ['styles']);
	gulp.watch("src/html/*.html", ['html']);
	gulp.watch("src/js/*.js",  ['scripts'], browserSync.reload);
});