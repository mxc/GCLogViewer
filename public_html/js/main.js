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
    'Charts', 'GCEvent', '$modal',
    function ($scope, $window, db, Charts, GCEvent, $modal) {

        //var db = new GCViewerDB();
        $scope.active = "";
        $scope.successes = [];
        $scope.errors = [];

        $scope.zoom = function (ratio) {
            Charts.zoom(ratio);
        }

        $scope.unset = function () {
            $scope.active = "";
        };

        function checkDB(file, host, date) {
            if (db.getStatus() === "closed") {
                db.createDataStore(function () {
                    processFile(file, host, date);
                });
                return false;
            } else {
                return true;
            }
        }

        function processFile(file, host, date) {
            if (!checkDB(file, host, date)) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var hash = CryptoJS.MD5(reader.result);
                //first check if file is already uploaded
                //then insert file data and gc log entries
                db.find('fileData', 'md5sum', hash.toString(), function (e) {
                    if (e.target.result) {
                        $scope.errors.push("The file has already been uploaded");
                        return;
                    }
                    var objs = [];
                    var lines = reader.result.split(/\r\n|\r|\n/g);
                    var newString = "";

                    lines.forEach(function (value, index, array) {
                        newString += value.replace(/(^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d*\+\d*:\s|^\d+\.\d+:\s)/, "__$1") + " ";
                    });

                    newString = newString.split(/__/);
                    newString.forEach(function (value, index, array) {
                        var obj = GCEvent.parseLogEntry(value, hash.toString(), false);
                        if (obj !== undefined) {
                            objs.push(obj);
                        }
                    });
                    //if no objects have been imported the file could be in a format
                    //that does not have PrintGCDetails enabled.
                    var count = objs.length;
                    if (count === 0) {
                        newString.forEach(function (value, index, array) {
                            var obj = GCEvent.parseLogEntry(value, hash.toString(), true);
                            if (obj !== undefined) {
                                objs.push(obj);
                            }
                        });
                    }
                    count=objs.length;
                    
                    var fileData = GCEvent.getFileData(file.name, hash.toString(), host, date);
                    db.updateDataStore("fileData", fileData, function (e) {
                        db.updateDataStore('gcEntry', objs, null, null, function (e) {
                            console.log("Aborted!");
                        }, function (e) {
                            $scope.successes.push("File loaded. " + count + " lines read.");
                            console.log("Committed " + count + " entries");
                        });
                    });
                });
            };
            reader.onerror = function (e) {
                $window.document.body.appendChild(document.createTextNode(reader.error));
            };
            reader.readAsText(file);
            return false;
        }
        ;

        $scope.addGraph = function () {
            this.active = "addGraph";
            var modalInstance = $modal.open({
                templateUrl: 'templates/addGraph.html',
                controller: 'addGraphController',
                scope: $scope
            });

            modalInstance.result.then(function (data) {
                data.index = "fileKey";
                Charts.drawChart(db, "#charts", data, true);
            }, function () {
                console.info('Modal dismissed ');
            });
        };

        $scope.dropDataStore = function () {
            db.dropDataStore();
        };

        $scope.createDataStore = function () {
            if (db.getStatus() === "closed") {
                db.createDataStore();
            }
        };

        $scope.openUploadDialog = function () {
            this.active = "showFileUploadForm";
            var modalInstance = $modal.open({
                templateUrl: 'templates/uploadfile.html',
                controller: 'uploadFileController'
            });

            modalInstance.result.then(function (data) {
                processFile(data.file, data.host, data.date);
            }, function () {
                console.info('Modal dismissed ');
            });
        };

        $scope.clearCharts = function () {
            Charts.clear();
        }
    }]);

app.controller('addGraphController', ['$scope', '$modalInstance', 'GCViewerDB', function ($scope, $modalInstance, db) {

        $scope.errors = [];
        $scope.successes = [];

        $scope.host = "";
        $scope.file = "";
        $scope.types = ["Heap Space", "Collection times", "Details"];

        function updateFiles() {
            db.getFiles($scope);
        }

        validate = function (name, item, arr) {
            if (item === undefined || item === null) {
                arr.push(name + " is invalid.");
            }
        };

        $scope.$watch("host", function (newval, oldval) {
            updateFiles();
        });

        $scope.files = [];
        $scope.hosts = db.getHosts($scope);

        $scope.ok = function () {
            $scope.errors = [];
            $scope.successes = [];
//            validate("File", $scope.file, $scope.errors);
//            validate("Server", $scope.host, $scope.errors);
            if ($scope.errors.length > 0) {
                return;
            } else {
                $modalInstance.close({key: $scope.file.key, file: $scope.file.fileName, host: $scope.host});
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

app.controller('uploadFileController', function ($scope, $modalInstance) {

    $scope.errors = [];
    $scope.successes = [];
    //$scope.$apply();

    validate = function (name, item, arr) {
        if (item === undefined || item === null) {
            arr.push(name + " is invalid.");
        }
    };

    $scope.ok = function () {
        $scope.errors = [];
        validate("File", $scope.file, $scope.errors);
        validate("Server", $scope.host, $scope.errors);
        if ($scope.errors.length > 0) {
            return;
        } else {
            $modalInstance.close({file: $scope.file, host: $scope.host, date: $scope.date});
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});