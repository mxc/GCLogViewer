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

app.directive("bootstrapnavbar", ["$window", function ($window) {
        return {
            retrict: 'E',
            template: '<nav class="navbar navbar-default navbar-inverse" role="navigation">' +
                    '<div class="container-fluid"><ng-transclude></ng-transclude></div></nav>',
            replace: true,
            transclude: true
        };
    }]);

app.directive("menutitle", function () {
    return {
        restrict: 'E',
        templateUrl: "templates/navbartitle.html",
        replace: true,
        transclude: true,
        scope: {}
    };
});


app.directive("dropdownmenuitem", function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            title: "@"
        },
        template: "<li role='presentation' class='dropdown'><a class='dropdown-toggle'" +
                " data-toggle='dropdown' href='#' role='button' ng-click='unset()'> {{title}} " +
                "<span class='caret'></span></a> <ul class='dropdown-menu'" +
                " role='menu' ng-transclude></ul></li>"
    };
});

app.directive("menu", function () {
    return {
        restrict: 'E',
        template: "<div class='collapse navbar-collapse' id='mainmenu'>" +
                "<ul class='nav navbar-nav navbar-left' ng-transclude></ul></div>",
        replace: true,
        transclude: true
    };
});

app.directive("menuitem", function () {
    return {
        restrict: 'E',
        template: "<li role='presentation'><a  href='#' ng-transclude></a></li>",
        replace: true,
        transclude: true
    };
});

