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

describe("GCLogViewer App Controller", function () {

    var $controller;
    var $q;

    var mockGCViewerDB = {
        getStatus: function () {
            return "open";
        },
        find: function (dataStore, index, key, func) {
            var e = {};
            e.target = {result: null};
            func(e);
        }
    };

    var mockCharts = {
        setFooter: function () {

        }
    };

    var mockModal = {};
    var $scope = {};
    var $window = {};
    var objs;

    function GCEvent(dateStamp, timeStamp,
            youngGenUsedPrior, youngGenUsedAfter, totalYoungGen,
            totalUsedPrior, totalUsedAfter, totalHeap, time, fileKey) {
        this.timeStamp = parseFloat(timeStamp);
        if (dateStamp !== null || dateStamp !== undefined) {
            this.dateStamp = Date.parse(dateStamp);
        }
        this.youngGenUsedPrior = youngGenUsedPrior === undefined ? undefined : parseInt(youngGenUsedPrior);
        this.youngGenUsedAfter = youngGenUsedAfter === undefined ? undefined : parseInt(youngGenUsedAfter);
        this.totalYoungGen = totalYoungGen === undefined ? undefined : parseInt(totalYoungGen);
        this.totalUsedPrior = parseInt(totalUsedPrior);
        this.totalUsedAfter = parseInt(totalUsedAfter);
        this.totalHeap = parseInt(totalHeap);
        this.time = parseFloat(time);
        this.fileKey = fileKey;
    }
    ;

    beforeEach(function(){
        var data=[];
        data.push(new GCEvent(new Date(), 1000, 1500, 1000, 2000, 3500, 3000, 4300, 12, 'somekey'));
        data.push(new GCEvent(new Date(), 2000, 1300, 800, 2000, 3300, 2900, 4300, 10, 'somekey'));
        data.push(new GCEvent(new Date(), 3000, 1800, 400, 2100, 3600, 3100, 4900, 8, 'somekey'));
        data.push(new GCEvent(new Date(), 4000, 1500, 1000, 2200, 3500, 2500, 5000, 15, 'somekey'));
        objs= getChartObjects(data);        
    });

    describe('Chart datapoint calculations:', function () {

        it("min max values for x/y axis", function () {
            expect(objs.miny).toBe(4300);
            expect(objs.maxy).toBe(5000);
            expect(objs.minx).toBe(1000);
            expect(objs.maxx).toBe(4000);
        });
        
        it("count of series",function(){
                        expect(objs.series.length).toBe(4);
        });
        
        it("young gen used",function(){
            expect(objs.series[0].name).toBe('Young Gen Used');
            expect(objs.series[0].data.length).toBe(9);
            expect(objs.series[0].data[0].x).toBe(0);
            expect(objs.series[0].data[0].y).toBe(0);
            
            expect(objs.series[0].data[1].x).toBe(999);
            expect(objs.series[0].data[1].y).toBe(1500);
            expect(objs.series[0].data[2].x).toBe(1000);
            expect(objs.series[0].data[2].y).toBe(1000);
            
            expect(objs.series[0].data[3].x).toBe(1999);
            expect(objs.series[0].data[3].y).toBe(1300);
            expect(objs.series[0].data[4].x).toBe(2000);
            expect(objs.series[0].data[4].y).toBe(800);
            
            expect(objs.series[0].data[5].x).toBe(2999);
            expect(objs.series[0].data[5].y).toBe(1800);
            expect(objs.series[0].data[6].x).toBe(3000);
            expect(objs.series[0].data[6].y).toBe(400);            
        })

        it("young gen total ",function(){
            expect(objs.series[1].name).toBe('Young Gen Total');
            expect(objs.series[1].data.length).toBe(9);
            expect(objs.series[1].data[0].x).toBe(0);
            expect(objs.series[1].data[0].y).toBe(2000);
            
            expect(objs.series[1].data[1].x).toBe(999);
            expect(objs.series[1].data[1].y).toBe(2000);
            expect(objs.series[1].data[2].x).toBe(1000);
            expect(objs.series[1].data[2].y).toBe(2000);
            
            expect(objs.series[1].data[3].x).toBe(1999);
            expect(objs.series[1].data[3].y).toBe(2000);
            expect(objs.series[1].data[4].x).toBe(2000);
            expect(objs.series[1].data[4].y).toBe(2000);
            
            expect(objs.series[1].data[5].x).toBe(2999);
            expect(objs.series[1].data[5].y).toBe(2000);
            expect(objs.series[1].data[6].x).toBe(3000);
            expect(objs.series[1].data[6].y).toBe(2100);            

            expect(objs.series[1].data[7].x).toBe(3999);
            expect(objs.series[1].data[7].y).toBe(2100);
            expect(objs.series[1].data[8].x).toBe(4000);
            expect(objs.series[1].data[8].y).toBe(2200);             
        });

        it("old gen used ",function(){
            expect(objs.series[2].name).toBe('Old Gen Used');
            expect(objs.series[2].data.length).toBe(9);
            expect(objs.series[2].data[0].x).toBe(0);
            expect(objs.series[2].data[0].y).toBe(0);
            
            expect(objs.series[2].data[1].x).toBe(999);
            expect(objs.series[2].data[1].y).toBe(4000);
            expect(objs.series[2].data[2].x).toBe(1000);
            expect(objs.series[2].data[2].y).toBe(4000);
            
            expect(objs.series[2].data[3].x).toBe(1999);
            expect(objs.series[2].data[3].y).toBe(4000);
            expect(objs.series[2].data[4].x).toBe(2000);
            expect(objs.series[2].data[4].y).toBe(4100);
            
            expect(objs.series[2].data[5].x).toBe(2999);
            expect(objs.series[2].data[5].y).toBe(3900);
            expect(objs.series[2].data[6].x).toBe(3000);
            expect(objs.series[2].data[6].y).toBe(4800);            

            expect(objs.series[2].data[7].x).toBe(3999);
            expect(objs.series[2].data[7].y).toBe(4200);
            expect(objs.series[2].data[8].x).toBe(4000);
            expect(objs.series[2].data[8].y).toBe(3700);             
        });
                
        
    });

});
