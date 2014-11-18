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


function GCEvent(dateStamp, timeStamp,
        youngGenUsedPrior, youngGenUsedAfter, totalYoungGen,
        totalUsedPrior, totalUsedAfter, totalHeap, time) {
    this.youngGenUsedBefore = parseInt(youngGenUsedPrior);
    this.timeStamp = parseFloat(timeStamp);
    if (dateStamp !== null) {
        this.dateStamp = Date.parse(dateStamp);
    }
    this.youngGenUsedAfter = parseInt(youngGenUsedAfter);
    this.totalYoungGen = parseInt(totalYoungGen);
    this.totalUsedPrior = parseInt(totalUsedPrior);
    this.totalUsedAfter = parseInt(totalUsedAfter);
    this.totalHeap = parseInt(totalHeap);
    this.time = parseFloat(time);
};

function parseLogEntry(line) {
    var regex = /(?:(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d*)(?:\+\d*:\s))?(\d*\.\d*:\s)?\[.*?(?:\[.*?(\d+)K->(\d+)K\((\d+)K\)(?:,?\s\d*\.\d* secs)?\])?(?:\s(\d+)K->(\d+)K\((\d+)K\)),\s(\d+\.\d+) secs]/;
    var matches = line.match(regex);
    if (!matches) {
        return;
    }
    var dateStamp = matches[1];
    var timeStamp = matches[2];
    var youngGenUsedPrior = matches[3];
    var youngGenUsedAfter = matches[4];
    var totalYoungGen = matches[5];
    var totalUsedPrior = matches[6];
    var totalUsedAfter = matches[7];
    var totalHeap = matches[8];
    var time = matches[9];
    var data = new GCEvent(dateStamp, timeStamp,
            youngGenUsedPrior, youngGenUsedAfter, totalYoungGen,
            totalUsedPrior, totalUsedAfter, totalHeap, time);
    return data;
};