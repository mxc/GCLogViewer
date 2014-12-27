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

describe("GCLogViewer Log File Parsing:", function () {

    var $q;
    var File;
    var $rootScope;
    var loadFileResult;

    var gcDetailsParNewParOld = 'Java HotSpot(TM) 64-Bit Server VM (25.25-b02) for linux-amd64 JRE (1.8.0_25-b17), built on Sep 17 2014 17:32:11 by "java_re" with gcc 4.3.0 20080428 (Red Hat 4.3.0-8)\r\n' +
            'Memory: 4k page, physical 8139304k(2450408k free), swap 0k(0k free)\r\n' +
            'CommandLine flags: -XX:InitialHeapSize=130228864 -XX:+ManagementServer -XX:MaxHeapSize=2083661824 -XX:+PrintGC -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseParallelGC -XX:+UseParallelOldGC\r\n' +
            '21.103: [GC (Allocation Failure) [PSYoungGen: 32197K->5104K(37888K)] 32197K->19976K(123904K), 0.0143535 secs] [Times: user=0.05 sys=0.05, real=0.01 secs]\r\n' +
            '32.292: [GC (Allocation Failure) [PSYoungGen: 37648K->5104K(37888K)] 52520K->31312K(123904K), 0.0099629 secs] [Times: user=0.04 sys=0.02, real=0.01 secs] \r\n' +
            '126.001: [GC (Allocation Failure) [PSYoungGen: 36400K->3136K(37888K)] 62608K->29352K(123904K), 0.0024378 secs] [Times: user=0.01 sys=0.00, real=0.01 secs] \r\n' +
            '127.509: [GC (Allocation Failure) [PSYoungGen: 35104K->5088K(37888K)] 61321K->60048K(123904K), 0.0141576 secs] [Times: user=0.06 sys=0.01, real=0.02 secs] \r\n' +
            '127.524: [Full GC (Ergonomics) [PSYoungGen: 5088K->0K(37888K)] [ParOldGen: 54960K->34240K(100352K)] 60048K->34240K(138240K), [Metaspace: 7875K->7875K(1056768K)], 0.0241912 secs] [Times: user=0.09 sys=0.02, real=0.02 secs] \r\n' +
            '226.718: [GC (Allocation Failure) [PSYoungGen: 32768K->4192K(37376K)] 67008K->42528K(137728K), 0.0031785 secs] [Times: user=0.01 sys=0.00, real=0.00 secs] \r\n' +
            '359.559: [GC (Allocation Failure) [PSYoungGen: 36448K->4224K(68096K)] 74784K->42560K(168448K), 0.0033096 secs] [Times: user=0.01 sys=0.00, real=0.01 secs] \r\n' +
            '490.046: [GC (Allocation Failure) [PSYoungGen: 35968K->4224K(35840K)] 74304K->42560K(136192K), 0.0020325 secs] [Times: user=0.01 sys=0.00, real=0.00 secs] \r\n' +
            '619.445: [GC (Allocation Failure) [PSYoungGen: 35456K->4224K(64000K)] 73792K->42560K(164352K), 0.0023471 secs] [Times: user=0.01 sys=0.00, real=0.00 secs] \r\n' +
            '745.835: [GC (Allocation Failure) [PSYoungGen: 34944K->64K(30720K)] 73280K->42536K(131072K), 0.0022216 secs] [Times: user=0.01 sys=0.01, real=0.00 secs]; \r\n';

    var fileData = {
        file: {
            name: 'testfiles/gc-1.log'
        },
        host: 'test',
        date: '2015-01-22'
    };
    
    beforeEach(function () {
        module('app');
        module(function ($provide) {
            dbMock = {
                init: function () {
                },
                newConnection: function () {
                },
                find: function (objStore, key, hash, success, error) {
                    var e = {
                        target: {}
                    };
                    success(e);
                }
            };
            $provide.value('db', dbMock);
        });
    });

    beforeEach(inject(function (_$q_, _File_, _$rootScope_) {
        $q = _$q_;
        File = _File_;
        $rootScope = _$rootScope_;
    }));


    //parse the log file once before each suite
    beforeEach(function () {
        var reader = {
            readAsText: function (filename) {
                this.onload("done");
            },
            result: gcDetailsParNewParOld
        };
        var fileObj = {
            reader: reader,
            fileData: fileData
        };
        File.loadFile(fileObj).then(function (result) {
            loadFileResult = result;
        });
        $rootScope.$apply();
    });




    describe("log file format with vm opts=gcDetails,UseParallelGC,UseParallelOldGC:", function () {
        
        it ('verfiy correct number of entries have been converted to gcEvent objects',function(){
                    expect(loadFileResult.objs.length).toBe(10);            
        });

        it('verfiy conversion of minor gc entry to gcEvent object before full gc',
                function () {
                    //first entry
                    expect(loadFileResult.objs[0].dateStamp).toBeNaN();
                    expect(loadFileResult.objs[0].timeStamp).toBe(21.103);
                    expect(loadFileResult.objs[0].youngGenUsedPrior).toBe(32197);
                    expect(loadFileResult.objs[0].youngGenUsedAfter).toBe(5104);
                    expect(loadFileResult.objs[0].totalYoungGen).toBe(37888);
                    expect(loadFileResult.objs[0].totalUsedPrior).toBe(32197);
                    expect(loadFileResult.objs[0].totalUsedAfter).toBe(19976);
                    expect(loadFileResult.objs[0].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[0].time).toBe(0.0143535);
                    expect(loadFileResult.objs[0].fileKey).toBe("740db65a826522570cec5a39b8691cf1");
                    //second entry
                    expect(loadFileResult.objs[1].timeStamp).toBe(32.292);
                    expect(loadFileResult.objs[1].dateStamp).toBeNaN();
                    expect(loadFileResult.objs[1].youngGenUsedPrior).toBe(37648);
                    expect(loadFileResult.objs[1].youngGenUsedAfter).toBe(5104);
                    expect(loadFileResult.objs[1].totalYoungGen).toBe(37888);
                    expect(loadFileResult.objs[1].totalUsedPrior).toBe(52520);
                    expect(loadFileResult.objs[1].totalUsedAfter).toBe(31312);
                    expect(loadFileResult.objs[1].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[1].time).toBe(0.0099629);
                    expect(loadFileResult.objs[1].fileKey).toBe("740db65a826522570cec5a39b8691cf1");
                    //third entry
                    expect(loadFileResult.objs[2].timeStamp).toBe(126.001);
                    expect(loadFileResult.objs[2].dateStamp).toBeNaN();
                    expect(loadFileResult.objs[2].youngGenUsedPrior).toBe(36400);
                    expect(loadFileResult.objs[2].youngGenUsedAfter).toBe(3136);
                    expect(loadFileResult.objs[2].totalYoungGen).toBe(37888);
                    expect(loadFileResult.objs[2].totalUsedPrior).toBe(62608);
                    expect(loadFileResult.objs[2].totalUsedAfter).toBe(29352);
                    expect(loadFileResult.objs[2].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[2].time).toBe(0.0024378);
                    expect(loadFileResult.objs[2].fileKey).toBe("740db65a826522570cec5a39b8691cf1");
                    //forth entry
                    expect(loadFileResult.objs[3].timeStamp).toBe(127.509);
                    expect(loadFileResult.objs[3].dateStamp).toBeNaN();
                    expect(loadFileResult.objs[3].youngGenUsedPrior).toBe(35104);
                    expect(loadFileResult.objs[3].youngGenUsedAfter).toBe(5088);
                    expect(loadFileResult.objs[3].totalYoungGen).toBe(37888);
                    expect(loadFileResult.objs[3].totalUsedPrior).toBe(61321);
                    expect(loadFileResult.objs[3].totalUsedAfter).toBe(60048);
                    expect(loadFileResult.objs[3].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[3].time).toBe(0.0141576);
                    expect(loadFileResult.objs[3].fileKey).toBe("740db65a826522570cec5a39b8691cf1");
                });
                
                it('verify conversion of full gc entry to gcEvent object',function(){
                    //fith entry (Full GC)
                    expect(loadFileResult.objs[4].timeStamp).toBe(127.524);
                    expect(loadFileResult.objs[4].dateStamp).toBeNaN();
                    expect(loadFileResult.objs[4].youngGenUsedPrior).toBe(5088);
                    expect(loadFileResult.objs[4].youngGenUsedAfter).toBe(0);
                    expect(loadFileResult.objs[4].totalYoungGen).toBe(37888);
                    expect(loadFileResult.objs[4].totalUsedPrior).toBe(60048);
                    expect(loadFileResult.objs[4].totalUsedAfter).toBe(34240);
                    expect(loadFileResult.objs[4].totalHeap).toBe(138240);
                    expect(loadFileResult.objs[4].time).toBe(0.0241912);
                    expect(loadFileResult.objs[4].fileKey).toBe("740db65a826522570cec5a39b8691cf1");                    
                });
                
                it('verify conversion of minor gc entry after full gc to gcEvent object',function(){
                    //sixth entry - after full gc
                    expect(loadFileResult.objs[5].timeStamp).toBe(226.718);
                    expect(loadFileResult.objs[5].dateStamp).toBeNaN();
                    expect(loadFileResult.objs[5].youngGenUsedPrior).toBe(32768);
                    expect(loadFileResult.objs[5].youngGenUsedAfter).toBe(4192);
                    expect(loadFileResult.objs[5].totalYoungGen).toBe(37376);
                    expect(loadFileResult.objs[5].totalUsedPrior).toBe(67008);
                    expect(loadFileResult.objs[5].totalUsedAfter).toBe(42528);
                    expect(loadFileResult.objs[5].totalHeap).toBe(137728);
                    expect(loadFileResult.objs[5].time).toBe(0.0031785);
                    expect(loadFileResult.objs[5].fileKey).toBe("740db65a826522570cec5a39b8691cf1");                       
                })
    });
});