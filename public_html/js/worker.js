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
(function () {
    self.addEventListener('message', function (e) {
        var array = e.data;
        getChartObject(array);
    });
    function getChartObject(array) {
        var propBag = {
            miny: 99999999,
            maxy: 0,
            minx: 9999999999,
            maxx: 0,
            series: [{
                    name: 'Young Gen Used',
                    colour: 'rgba(255,183,57,0.7)' /*'#FFB739'*/,
                    data: []
                },
                {
                    name: 'Young Gen Total',
                    colour: 'rgba(250,97,33,0.7)' /*'#FA6121'*/,
                    data: []
                },
                {
                    name: 'Old Gen Used',
                    colour: 'rgba(140,72,159,0.7)' /*'#8C489F'*/,
                    data: []
                },
                {
                    name: 'Total Heap',
                    colour: 'rgba(68,50,102,0.7)'/*'#443266'*/,
                    data: []
                }
            ]
        };
        array.forEach(function (value, index, array) {
            //if this is the first entry we need a start point so create one
            if (index === 0) {
                propBag.series[0].data.push({x: 0, y: 0});
                propBag.series[0].data.push({x: value.timeStamp - 1, y: value.youngGenUsedPrior === undefined ? 0 : value.youngGenUsedPrior});
                propBag.series[1].data.push({x: 0, y: value.totalYoungGen === undefined ? 0 : value.totalYoungGen});
                propBag.series[1].data.push({x: value.timeStamp - 1, y: value.totalYoungGen === undefined ? 0 : value.totalYoungGen});
                propBag.series[2].data.push({x: 0, y: 0});
                propBag.series[2].data.push({x: value.timeStamp - 1, y: 0});
                propBag.series[3].data.push({x: 0, y: isNaN(value.totalHeap) ? 0 : value.totalHeap});
                propBag.series[3].data.push({x: value.timeStamp - 1, y: isNaN(value.totalHeap) ? 0 : value.totalHeap});
            } else {
                propBag.series[0].data.push({x: value.timeStamp - 1, y: value.youngGenUsedPrior === undefined ? 0 : value.youngGenUsedPrior});
                propBag.series[1].data.push({x: value.timeStamp - 1, y: array[index - 1].totalYoungGen === undefined ? 0 : array[index - 1].totalYoungGen});
                propBag.series[2].data.push({x: value.timeStamp - 1, y: calcOldGenUsed(array[index - 1])});
                propBag.series[3].data.push({x: value.timeStamp - 1, y: array[index - 1].totalHeap});
            }
            propBag.series[0].data.push({x: value.timeStamp, y: value.youngGenUsedAfter === undefined ? 0 : value.youngGenUsedAfter});
            propBag.series[1].data.push({x: value.timeStamp, y: value.totalYoungGen === undefined ? 0 : value.totalYoungGen});
            propBag.series[2].data.push({x: value.timeStamp, y: calcOldGenUsed(value)});
            propBag.series[3].data.push({x: value.timeStamp, y: isNaN(value.totalHeap) ? 0 : value.totalHeap});
            propBag.miny = value.totalHeap < propBag.miny ? value.totalHeap : propBag.miny;
            propBag.maxy = value.totalHeap > propBag.maxy ? value.totalHeap : propBag.maxy;
            propBag.minx = value.timeStamp < propBag.minx ? value.timeStamp : propBag.minx;
            propBag.maxx = value.timeStamp > propBag.maxx ? value.timeStamp : propBag.maxx;
        });
        self.postMessage(propBag);
    }


    function calcOldGenUsed(value) {
        var tmpValueYGA = value.youngGenUsedAfter === undefined ? 0 : value.youngGenUsedAfter;
        var tmpValueYGT = value.totalYoungGen === undefined ? 0 : value.totalYoungGen;

        var result = value.totalUsedAfter - tmpValueYGA + tmpValueYGT;
        //console.log(result);
        return isNaN(result) ? 0 : result;
    }
})();