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

var app = angular.module("app", []);

app.directive("navbar", function () {
    return {
        retrict: 'A',
        controller: 'NavBarController',
        templateUrl: '/templates/nav.html',
        //replace:true,
        transclude: false,
        scope: {},
        compile: 
        function (scope, element, attrs,more) {
            return function (scope, element, attrs, ctrl) {
                scope.title = element.find("title").text();
                var children = element.find("menu");
                console.log(element);
                console.log(children);
                var menuitems = [];
                for (var i = 0; i < children.length; i++) {
                    menuitems.push(
                            {
                                title: children[i].text(),
                                onclick: children[i].attr('ng-click')
                            }
                    );
                }
                scope.menuitems = menuitems;
                }
            }
    };
});

app.controller("NavBarController", ['$scope', '$attrs',
    function ($scope) {
        this.active = "";
    }]);

app.controller("GCLogViewerController", ['$scope', '$window', 'GCViewerDB',
    'Chart', 'GCEvent',
    function ($scope, $window, GCViewerDB, Chart, GCEvent) {

        var db = new GCViewerDB();
        db.initDb();

        $scope.showFileUploadForm = function () {
            toggle("loadFile");
        };

        $scope.processFile = function () {
            var file = $scope.file;
            var reader = new FileReader();
            reader.onload = function (e) {
                var objs = [];
                var lines = reader.result.split(/\r\n|\r|\n/g);
                lines.forEach(function (value, index, array) {
                    var obj = GCEvent.parseLogEntry(value);
                    if (obj !== undefined) {
                        objs.push(obj);
                    }
                });
                db.updateDataStore(objs);
            };
            reader.onerror = function (e) {
                $window.document.body.appendChild(document.createTextNode(reader.error));
            };
            reader.readAsText(file);
            return false;
        };

        $scope.drawGraph = function () {
            toggle("drawChart");
            Chart.drawChart(db, "#chart", "#legend");
        };

        $scope.dropDataStore = function () {
            db.dropDataStore();
        };

        $scope.createDataStore = function () {
            return  db.createDataStore();
        };

    }]);