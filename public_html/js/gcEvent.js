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

app.factory("GCEvent", ['$q', 'GCViewerDB', function ($q, db) {

        function FileData(fileName, md5Sum, host, date) {
            this.fileName = fileName;
            this.md5Sum = md5Sum;
            this.host = host;
            this.date = date;
        }

        function GCEvent(dateStamp, timeStamp,
                youngGenUsedPrior, youngGenUsedAfter, totalYoungGen,
                totalUsedPrior, totalUsedAfter, totalHeap, time, fileKey) {
            this.timeStamp = parseFloat(timeStamp);
            if (dateStamp !== null || dateStamp!==undefined) {
                this.dateStamp = Date.parse(dateStamp);
            }
            this.youngGenUsedPrior = youngGenUsedPrior===undefined?undefined:parseInt(youngGenUsedPrior);
            this.youngGenUsedAfter = youngGenUsedAfter===undefined?undefined:parseInt(youngGenUsedAfter);
            this.totalYoungGen = totalYoungGen===undefined?undefined:parseInt(totalYoungGen);
            this.totalUsedPrior = parseInt(totalUsedPrior);
            this.totalUsedAfter = parseInt(totalUsedAfter);
            this.totalHeap = parseInt(totalHeap);
            this.time = parseFloat(time);
            this.fileKey = fileKey;
        }

        var getFileData = function (file, md5sum, host, date) {
            var fileObj = new FileData(file, md5sum, host, date);
            return fileObj;
        };

        //Refactor Me
        var parseLogEntry = function (line, filekey, nogcDetails) {
            var regex;
            var data;
            //log files without gcDetails enabled
            if (nogcDetails) {
                regex = /(?:(?:(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d*)(?:\+\d*:\s))?(\d+\.\d+):\s)?.*?(?: (?:(\d+)K->(\d+)K\((\d+)K\)(?:,\s(\d*\.\d*) secs)?)\]) ?/;
                var matches = line.match(regex);
                if (!matches) {
                    return;
                }
                var dateStamp = matches[1];
                var timeStamp = matches[2];
                var youngGenUsedPrior = undefined;
                var youngGenUsedAfter = undefined;
                var totalYoungGen = undefined;
                var youngTime = undefined;
                var totalUsedPrior = matches[3];
                var totalUsedAfter = matches[4];
                var totalHeap = matches[5];
                var time = matches[6];
                data = new GCEvent(dateStamp, timeStamp,
                        youngGenUsedPrior, youngGenUsedAfter, totalYoungGen,
                        totalUsedPrior, totalUsedAfter, totalHeap, time, filekey);

            } else {
                //log files with gcDetails
                regex = /(?:(?:(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d*)(?:\+\d*:\s))?(\d+\.\d+):\s)?\[.*?\[.*?(\d+)K->(\d+)K\((\d+)K\)(?:.*,\s\d*\.\d* secs)?\](?: \[.*\])?(?:\s(\d+)K->(\d+)K\((\d+)K\))(?:.*,\s(\d*\.\d*) secs\])?/;
                var matches = line.match(regex);
                if (!matches) {
                    return;
                }
                //console.log(matches);
                var dateStamp = matches[1];
                var timeStamp = matches[2];
                var youngGenUsedPrior = matches[3];
                var youngGenUsedAfter = matches[4];
                var totalYoungGen = matches[5];
                //var youngTime = matches[6];
                var totalUsedPrior = matches[6];
                var totalUsedAfter = matches[7];
                var totalHeap = matches[8];
                var time = matches[9];
                data = new GCEvent(dateStamp, timeStamp,
                        youngGenUsedPrior, youngGenUsedAfter, totalYoungGen,
                        totalUsedPrior, totalUsedAfter, totalHeap, time, filekey);
            }
            return data;
        };

        function saveGCEntries(dataObj) {
            var deferred = $q.defer();
            var fileObjData = dataObj.fileDataObj;
            var objs = dataObj.objs;
            var count = objs.length;
            db.updateDataStore("fileData", fileObjData, function (e) {
                db.updateDataStore('gcEntry', objs, function (e) {
                    deferred.resolve("File loaded. " + count + " lines read.");
                }, function (e) {
                    deferred.reject(e);
                }), function (e) {
                    //console.log("Committed " + count + " entries");
                    deferred.reject(e);
                };
            });
            return deferred.promise;
        };

        return {
            parseLogEntry: parseLogEntry,
            getFileData: getFileData,
            saveGCEntries: saveGCEntries
        };

    }]);