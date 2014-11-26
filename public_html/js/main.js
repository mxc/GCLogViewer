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

var app = angular.module("app", ['ui.bootstrap']);

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
        scope: {},
    };
});


app.directive("dropdownmenuitem", function () {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            title: "@",
        },
        template: "<li role='presentation' class='dropdown'><a class='dropdown-toggle'" +
                " data-toggle='dropdown' href='#' role='button' ng-click='unset()'> {{title}} " +
                "<span class='caret'></span></a> <ul class='dropdown-menu'" +
                " role='menu' ng-transclude></ul></li>",
    }
});

app.directive("menu", function () {
    return {
        restrict: 'E',
        template: "<div class='collapse navbar-collapse' id='mainmenu'>" +
                "<ul class='nav navbar-nav navbar-left' ng-transclude></ul></div>",
        replace: true,
        transclude: true
    }
});

app.directive("menuitem", function () {
    return {
        restrict: 'E',
        template: "<li role='presentation'><a  href='#' ng-transclude></a></li>",
        replace: true,
        transclude: true,
    }
});

app.controller("GCLogViewerController", ['$scope', '$window', 'GCViewerDB',
    'Chart', 'GCEvent', '$modal',
    function ($scope, $window, GCViewerDB, Chart, GCEvent, $modal) {

        var db = new GCViewerDB();
        db.initDb();
        $scope.active = "";

        $scope.unset = function () {
            $scope.active = "";
        }

        function processFile(filename) {
            var file = filename;
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


        $scope.viewCharts = function () {
            this.active = "viewCharts";
            Chart.drawChart(db, "#chart", "#legend");
        };

        $scope.dropDataStore = function () {
            db.dropDataStore();
        };

        $scope.createDataStore = function () {
            db.createDataStore();
        };

        $scope.openUploadDialog = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/uploadfile.html',
                controller: 'ModalInstanceController'
            });

            modalInstance.result.then(function (filename) {
                processFile(filename);
            }, function () {
                console.info('Modal dismissed ');
            });
        };
    }]);


app.controller('ModalInstanceController', function ($scope, $modalInstance) {
    $scope.ok = function () {
        $modalInstance.close($scope.filename);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});