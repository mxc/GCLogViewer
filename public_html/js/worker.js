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

importScripts("gcViewerDB.js","db.js");

self.addEventListener('message', function (e) {
    var array = e.data;
    getChartObject(array)
});

function getChartObject(array) {
    var propBag = {
        minHeap:99999999,
        maxHeap:0,
        minTimeStamp:9999999999,
        maxTimeStamp:0
    };
    array.forEach(function(value,index,array){
        propBag.minHeap = value.totalHeap <propBag.minHeap? value.totalHeap:propBag.minHeap;
        propBag.maxHeap = value.totalHeap >propBag.maxHeap? value.totalHeap:propBag.maxHeap;
        propBag.minTimeStamp = value.timeStamp< propBag.minTimeStamp? value.timeStamp: propBag.minTimeStamp;
        propBag.maxTimeStamp = value.timeStamp> propBag.maxTimeStamp? value.timeStamp: propBag.maxTimeStamp;
    });
    this.postMessage(propBag);
}
