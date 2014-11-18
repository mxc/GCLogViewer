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

self.addEventListener('message',function(e){
    var gcViewerDB = e.gcViewerDB;
    getChartObject(gcViwerDB);
});

function getChartObject(db) {
   // db.findMax('timeStamp');
   // db.findMin('timeStamp');
  //  db.findMin('totalHeap');
  //  db.findMax('totalHeap');
  //  var data = db.processObjectArray();
//                
//                db.processObjectArray('gcEntry', function (array) {
//                    console.log("drawing data point");
//                    array.forEach(function (value, index, array) {
//                        var li = document.createElement("li");
//                        var str = value.timeStamp+" "+value.totalHeap;
//                        li.appendChild(document.createTextNode(str));
//                        var ul = document.getElementById("list");
//                        ul.appendChild(li);
//                    });
//                },{result:0,callback:function(){console.log("callback fired");}});    
}



