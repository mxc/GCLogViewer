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
app.factory('File',['$q','db','GCEvent', function ($q,db,GCEvent) {

    function fileExists(reader) {
        var deferred = $q.defer();
        var hash = CryptoJS.MD5(reader.result);
        //first check if file is already uploaded
        //then insert file data and gc log entries
        db.find('fileData', 'md5sum', hash.toString(), function (e) {
            if (e.target.result) {
                deferred.reject("The file has already been uploaded");
            } else {
                deferred.resolve({text: reader.result, hash: hash});
            }
        }, function (e) {
            deferred.reject("error accessing db");
        });
        return deferred.promise;
    };

    function loadFile(fileObj) {
        var deferred = $q.defer();
        var reader = fileObj.reader;
        var fileData = fileObj.fileData;
        reader.onload = function (e) {
            fileExists(reader).then(
                    function (result) {
                        var objs = [];
                        var lines = result.text.split(/\r\n|\r|\n/g);
                        var newString = "";
                        //to cater for entries spread over mutliple lines
                        //we search for all lines beginning with the data/timestamp
                        //string and then insert __ at the beginning as a new
                        //entry marker. This is used to split the file into an
                        //array of entries for processing
                        lines.forEach(function (value, index, array) {
                            newString += value.replace(/(^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d*\+\d*:\s|^\d+\.\d+:\s)/, "__$1") + " ";
                        });
                        newString = newString.split(/__/);
                        newString.forEach(function (value, index, array) {
                            var obj = GCEvent.parseLogEntry(value, result.hash.toString(), false);
                            if (obj !== undefined) {
                                objs.push(obj);
                            }
                        });
                        //if no objects have been imported the file could be in a format
                        //that does not have PrintGCDetails enabled.
                        var count = objs.length;
                        if (count === 0) {
                            newString.forEach(function (value, index, array) {
                                var obj = GCEvent.parseLogEntry(value, result.hash.toString(), true);
                                if (obj !== undefined) {
                                    objs.push(obj);
                                }
                            });
                        }
                        count = objs.length;
                        var fileDataObj = GCEvent.getFileData(fileData.file.name, result.hash.toString(), fileData.host, fileData.date);
                        deferred.resolve({fileDataObj:fileDataObj, objs: objs});
                    }, function (error) {
                deferred.reject(error);
            });
        };
        reader.onerror = function (e) {
            deferred.reject(reader.error);
        };
        reader.readAsText(fileData.file);
        return deferred.promise;
    };

   function getFile(fileData) {
        var deferred = $q.defer();
        var reader = new FileReader();
        if (reader) {
            deferred.resolve({reader: reader, fileData: fileData});
        } else {
            deferred.reject("Failed to created file reader object");
        }
        return deferred.promise;

    }
    
    return {
        getFile:getFile,
        fileExists:fileExists,
        loadFile:loadFile
    };
}]);