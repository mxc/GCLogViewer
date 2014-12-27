/* 
 * Copyright 2014 mark.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function (config) {
    config.set({
        basePath: './public_html',
        files: [
            'bower_components/angular/*.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-bootstrap/ui-bootstrap.js',
            '../test/**/*.js',
            'js/main.js',
            'js/*.js'
        ],
        exclude: [
            'js/db.js'
        ],
        autoWatch: true,
        frameworks: ['jasmine'],
        browsers: [
            'PhantomJS'
        ],
        plugins: [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-phantomjs-launcher'
        ],
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        singleRun: false
    });
};
