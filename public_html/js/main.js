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


app.controller("GCLogViewerController", ['$scope', '$window', 'GCViewerDB',
    'Chart', 'GCEvent', '$modal',
    function ($scope, $window, GCViewerDB, Chart, GCEvent, $modal) {

        var db = new GCViewerDB();
        db.initDb();
        $scope.active = "";
        $scope.successes = [];
        $scope.errors = [];

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
                var count = objs.length;
                db.updateDataStore(objs,null,null,function(e){ 
                    console.log("Aborted!");
                },function(e){
                    $scope.successes.push("File loaded. "+count+" lines read.");
                    console.log("Committed "+ count +" entries");
                });
            };
            reader.onerror = function (e) {
                $window.document.body.appendChild(document.createTextNode(reader.error));
            };
            reader.readAsText(file);
            return false;
        }
        ;


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

    function validate(name, item, arr) {
        if (item === undefined || item === null) {
            arr.push(name + " is invalid.");
        }
    }

    $scope.ok = function () {
        $scope.errors = [];
        validate("File", $scope.file, $scope.errors);
        validate("Server", $scope.host, $scope.errors);
        if ($scope.errors.length > 0) {
            return;
        } else {
            $modalInstance.close($scope.file);
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});