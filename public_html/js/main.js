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

app.controller("GCLogViewerController", ['$scope', '$window', '$q', 'GCViewerDB',
    'Charts', 'GCEvent', 'File', '$modal',
    function ($scope, $window, $q, db, Charts, GCEvent, File, $modal) {

        $scope.active = "";
        $scope.successes = [];
        $scope.errors = [];
        Charts.setFooter();

        //var wrapper = document.getElementById("wrapper");
        //wrapper.setAttribute("style", "min-height:" + (window.innerHeight - 65) + "px;");
        $scope.zoom = function (ratio) {
            Charts.zoom(ratio);
        };

        window.addEventListener("resize", function () {
            Charts.windowResize();
        });

        $scope.unset = function () {
            $scope.active = "";
        };

        $scope.openDB = function (filedata) {
            var deferred = $q.defer();
            if (db.getStatus() === "closed") {
                db.createDataStore(function () {
                    deferred.resolve(filedata);
                });
            } else {
                deferred.resolve(filedata);
            }
            return deferred.promise;
        };

        $scope.processFile = function (filedata) {
            document.body.style.cursor = "wait";
            this.createDataStore().then(function () {
                $scope.openDB(filedata).then(File.getFile).then(File.loadFile, function (error) {
                    $scope.errors.push("The file has already been uploaded");
                }).then(GCEvent.saveGCEntries).then(function (msg) {
                    $scope.successes.push(msg);
                    document.body.style.cursor = "";
                }, function (e) {
                    $scope.errors.push(e);
                    document.body.style.cursor = "";
                });
            });
        };

        $scope.addGraph = function () {
            this.active = "addGraph";
            var modalInstance = $modal.open({
                templateUrl: 'templates/addGraph.html',
                controller: 'addGraphController',
                scope: $scope
            });
            modalInstance.result.then(function (data) {
                var elms = document.getElementsByClassName("blurb");
                _.each(elms, function (value) {
                    value.setAttribute("style", "display:none;");
                });
                data.index = "fileKey";
                db.find("fileData", "md5sum", data.key, function (e) {
                    var file = e.target.result;
                    data.title = file.fileName;
                    if (file.date !== undefined) {
                        data.title += "-(" + file.date + ")";
                    }
                    var container = document.getElementsByClassName("chart-table-container")[0];
                    Charts.drawChart(db, container, data, true);
                }, function (e) {
                    $scope.errors.push("Failed to load graph");
                });
            }, function () {
                console.info('Modal dismissed ');
            });
        };
        $scope.dropDataStore = function () {
            db.dropDataStore();
        };
        $scope.createDataStore = function () {
            var deferred = $q.defer();
            try {
                if (db.getStatus() === "closed") {
                    db.createDataStore(deferred.resolve("creating datastore"));
                } else {
                    deferred.resolve("datastore exists");
                }
            } catch (e) {
                    //can happen that the datastore has been dropped and
                    //therefore an error is thrown as the status is "closing".
                    //back off and then create the db.
                   document.window.setTimeout(100,function(){
                       db.createDataStore(deferred.resolve("creating datastore"));
                   });
            }
            return deferred.promise;
        };
        $scope.openUploadDialog = function () {
            this.active = "showFileUploadForm";
            var modalInstance = $modal.open({
                templateUrl: 'templates/uploadfile.html',
                controller: 'uploadFileController'
            });
            modalInstance.result.then(function (fileData) {
                $scope.processFile(fileData);
            }, function () {
                console.info('Modal dismissed ');
            });
        };
        $scope.clearCharts = function () {
            Charts.clear();
            var elms = document.getElementsByClassName("blurb");
            _.each(elms, function (value) {
                value.setAttribute("style", "");
            });
        }
        ;
    }]);

app.controller('addGraphController', ['$scope', '$modalInstance', 'GCViewerDB', function ($scope, $modalInstance, db) {

        $scope.errors = [];
        $scope.successes = [];
        $scope.host = "";
        $scope.selectedFile = "";
        $scope.files = [];
        //$scope.types = ["Heap Space", "Collection times", "Details"];

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

        db.getHosts(function (data) {
            var hosts = [];
            data.forEach(function (value) {
                hosts.push(value.host);
            });
            hosts.sort();
            hosts = _.unique(hosts, true);
            $scope.hosts = hosts;
            $scope.host = hosts[0];
        }, function (e) {
            console.log(e);
        });

        $scope.ok = function () {
            $modalInstance.close({key: $scope.selectedFile.key, file: $scope.selectedFile.fileName, host: $scope.host});
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

app.controller('uploadFileController', ['$scope', '$modalInstance', 'GCViewerDB', '$q', function ($scope, $modalInstance, $db, $q) {

        $scope.errors = [];
        $scope.successes = [];
        $scope.$apply();

        var validate = function (name, item, arr) {
            if (item === undefined || item === null) {
                arr.push(name + " is invalid.");
            }
        };

        $scope.openDB = function (filedata) {
            var deferred = $q.defer();
            if ($db.getStatus() === "closed") {
                $db.createDataStore(function () {
                    deferred.resolve(filedata);
                });
            } else {
                deferred.resolve(filedata);
            }
            return deferred.promise;
        };

        $scope.getOptions = function (callback) {
            $scope.openDB().then(function () {
                $db.getHosts(function (data) {
                    var search = [];
                    data.forEach(function (value) {
                        search.push(value.host);
                    });
                    search.sort();
                    search = _.unique(search, true);
                    callback({
                        minLength: 1,
                        source: search,
                        delay: 200,
                        appendTo: document.getElementById("host").parentElement,
                        position: {my: "left top", at: "left bottom"}
                    });
                },
                        function (e) {
                            console.log(e);
                        });
            });
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
        }
        ;
    }]);