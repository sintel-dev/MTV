const webpack = require('webpack');
const webpackConfig = require("./webpack.conf");


let wpConfig = webpackConfig({
    entryPoints: {
        'main': __dirname + '/src/main.ts'
    },
    outputDir: __dirname + '/public/dist'
});

// wpConfig.plugins = [
//     new webpack.ProvidePlugin({
//         $: 'jquery',
//         jQuery: 'jquery',
//         $ext1: 'jquery.rest'
//     })
// ];

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai', 'sinon'],
        files: [
            'tests/**/*.ts'
        ],
        exclude: [
        ],
        preprocessors: {
            'tests/**/*.ts': ['webpack']
        },
        webpack: {
            module: wpConfig.module,
            resolve: wpConfig.resolve,
            plugins: wpConfig.plugins
        },
        reporters: ["progress"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ["PhantomJS"],
        singleRun: true,
        concurrency: Infinity
    });
};
