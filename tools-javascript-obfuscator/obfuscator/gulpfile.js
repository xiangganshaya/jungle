var gulp = require("gulp");
var fileInline = require("gulp-file-inline");
var htmlmin = require("gulp-htmlmin");
var javascriptObfuscator = require("gulp-javascript-obfuscator");


var rootPath = "../../build/"

gulp.task("obfuscator", gulp.series(function (cb) {
    gulp.src([rootPath + "web-mobile/assets/main/**/index.*.js"])
        .pipe(javascriptObfuscator({
            compact: true,
            controlFlowFlattening: false,
            deadCodeInjection: false,
            // debugProtection: true,
            // debugProtectionInterval: 3000,
            debugProtection: false,
            debugProtectionInterval: 0,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: false,
            renameGlobals: false,
            selfDefending: true,
            simplify: true,
            splitStrings: false,
            stringArray: true,
            stringArrayCallsTransform: false,
            stringArrayEncoding: ['rc4'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 1,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 2,
            stringArrayWrappersType: 'variable',
            stringArrayThreshold: 0.75,
            unicodeEscapeSequence: false,
        }))
        .pipe(gulp.dest(rootPath + "web-mobile/assets/main/").on("end", cb));
}));

gulp.task('default', gulp.series('obfuscator'));


