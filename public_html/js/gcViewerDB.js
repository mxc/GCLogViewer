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

app.factory('GCViewerDB', ['db', function (db) {

        var GCViewerDB = function () {
            this.db = db;
            this.initDb();
        };

        GCViewerDB.prototype.initDb = function (callback) {

            var schema = [{
                    gcEntry: {
                        params: {
                            autoIncrement: true
                        }
                    }
                },
                {
                    gcEntry: {
                        indices: [
                            ['timestamp', 'timeStamp', {unique: false}],
                            ['dateStamp', 'dateStamp', {unique: false}],
                            ['fileKey'  , 'fileKey'  , {unique: false}]
                        ]
                    }
                },
                {
                    fileData: {
                        params: {
                            autoIncrement: true
                        },
                        indices: [
                            ['filename', 'fileName', {unique: true}],
                            ['md5sum', 'md5Sum', {unique: true}]
                        ]
                    }
                }];

            this.db.init("GCViewer", 3, schema);
            this.db.newConnection(callback);
        };


        GCViewerDB.prototype.updateDataStore = function (storeName, objs, onsuccess, onerror, onabort, oncommit) {
            var objStore = this.db.getObjectStoreFromTransaction(storeName, "readwrite", onabort, oncommit);
            if (Array.isArray(objs)) {
                this.db.insertObjectArray(objStore, objs, onsuccess, onerror);
            } else {
                this.db.insertObject(objStore, objs, onsuccess, onerror);
            }
        };

        GCViewerDB.prototype.dropDataStore = function () {
            this.db.dropDataStore();
        };

        GCViewerDB.prototype.createDataStore = function (callback) {
            this.initDb(callback);
        };

        GCViewerDB.prototype.findMin = function (attribute, resultObj) {
            this.db.findMax('gcEntry', attribute, resultObj);
        };

        GCViewerDB.prototype.findMax = function (attribute, resultObj) {
            this.db.findMax('gcEntry', attribute, resultObj);
        };

        GCViewerDB.prototype.find = function (objStore, index, key, onsuccess, onerror) {
            this.db.find(objStore, index, key, onsuccess, onerror);
        };

        GCViewerDB.prototype.findAll = function (objStore, index, key, onsuccess, onerror) {
            this.db.findAll(objStore, index, key, onsuccess, onerror);
        };

//        GCViewerDB.prototype.getDataPoints = function (data,callback) {
//            this.db.find('gcEntry',data.index,data.key,callback);
//        };

        GCViewerDB.prototype.getHosts = function ($scope) {
            this.db.getObjectArray("fileData", function (array) {
                if ($scope.hosts!==undefined){
                    $scope.hosts.length = 0;
                }
                var tmpArray = [];
                array.forEach(function (item, index, array) {
                    tmpArray.push(item.host);
                });
                tmpArray.sort();
                tmpArray = _.uniq(tmpArray);
                $scope.hosts = tmpArray;
                $scope.host = $scope.hosts[0];
            });
        };

        GCViewerDB.prototype.getFiles = function ($scope) {
            this.db.getObjectArray("fileData", function (array) {
                $scope.files.length = 0;
                var tmpFiles =_.filter(array,_.matches({host: $scope.host}));
                tmpFiles.forEach(function(item,index,array){
                    $scope.files.push({key:item.md5Sum, fileName:item.fileName});
                });
                $scope.files.sort(function(a,b){
                    return a.fileName.localeCompare(b.fileName);
                });
                $scope.file = $scope.files[0];
                $scope.$apply();
            });
        };
        
        GCViewerDB.prototype.getStatus=function(){
                return this.db.getStatus();
        };

        return new GCViewerDB();
    }]);