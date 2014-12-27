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

    var gcDetailsParNewParOld = 'Java HotSpot(TM) 64-Bit Server VM (25.25-b02) for linux-amd64 JRE (1.8.0_25-b17), built on Sep 17 2014 17:32:11 by "java_re" with gcc 4.3.0 20080428 (Red Hat 4.3.0-8) \n' +
            'Memory: 4k page, physical 8139328k(2218992k free), swap 0k(0k free) \n' +
            'CommandLine flags: -XX:InitialHeapSize=130229248 -XX:+ManagementServer -XX:MaxHeapSize=2083667968 -XX:+PrintGC -XX:+PrintGCDateStamps -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseParallelGC \n' +
            '2014-12-27T18:15:33.680+0200: 25.290: [GC (Allocation Failure) [PSYoungGen: 31459K->5104K(37888K)] 31459K->17976K(123904K), 0.0128589 secs] [Times: user=0.04 sys=0.03, real=0.01 secs] \n' +
            '2014-12-27T18:15:35.099+0200: 26.708: [GC (Allocation Failure) [PSYoungGen: 35995K->5088K(37888K)] 48867K->46760K(123904K), 0.0145684 secs] [Times: user=0.08 sys=0.02, real=0.01 secs] \n' +
            '2014-12-27T18:15:36.619+0200: 28.229: [GC (Allocation Failure) [PSYoungGen: 36823K->5088K(37888K)] 78495K->77488K(123904K), 0.0155940 secs] [Times: user=0.06 sys=0.01, real=0.01 secs] \n' +
            '2014-12-27T18:15:36.635+0200: 28.245: [Full GC (Ergonomics) [PSYoungGen: 5088K->0K(37888K)] [ParOldGen: 72400K->77258K(148992K)] 77488K->77258K(186880K), [Metaspace: 7864K->7864K(1056768K)], 0.0415384 secs] [Times: user=0.20 sys=0.06, real=0.05 secs] \n' +
            '2014-12-27T18:15:38.183+0200: 29.792: [GC (Allocation Failure) [PSYoungGen: 31909K->4288K(37888K)] 109168K->108171K(186880K), 0.0113512 secs] [Times: user=0.06 sys=0.01, real=0.01 secs] \n' +
            '2014-12-27T18:15:39.700+0200: 31.310: [GC (Allocation Failure) [PSYoungGen: 36226K->4352K(37376K)] 140109K->138955K(186368K), 0.0132218 secs] [Times: user=0.07 sys=0.02, real=0.01 secs] \n' +
            '2014-12-27T18:15:39.714+0200: 31.323: [Full GC (Ergonomics) [PSYoungGen: 4352K->0K(37376K)] [ParOldGen: 134603K->138684K(224768K)] 138955K->138684K(262144K), [Metaspace: 7867K->7867K(1056768K)], 0.0291450 secs] [Times: user=0.15 sys=0.00, real=0.03 secs] \n' +
            '2014-12-27T18:15:41.249+0200: 32.859: [GC (Allocation Failure) [PSYoungGen: 31845K->30944K(64512K)] 170529K->169628K(289280K), 0.0128679 secs] [Times: user=0.06 sys=0.03, real=0.01 secs] \n' +
            '2014-12-27T18:15:42.467+0200: 34.077: [GC (Allocation Failure) [PSYoungGen: 56260K->43264K(70656K)] 194944K->194236K(295424K), 0.0211279 secs] [Times: user=0.09 sys=0.06, real=0.03 secs] ';

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




    describe("log file format with vm opts=gcDetails,UseParallelGC,(UseSerial -default for old):", function () {

        it('verfiy correct number of entries have been converted to gcEvent objects', function () {
            expect(loadFileResult.objs.length).toBe(9);
        });

        it('verfiy conversion of minor gc entry to gcEvent object before full gc',
                function () {
                    //first entry
                    expect(loadFileResult.objs[0].dateStamp).toBe(Date.parse('2014-12-27T18:15:33.680'));
                    expect(loadFileResult.objs[0].timeStamp).toBe(25.290);
                    expect(loadFileResult.objs[0].youngGenUsedPrior).toBe(31459);
                    expect(loadFileResult.objs[0].youngGenUsedAfter).toBe(5104);
                    expect(loadFileResult.objs[0].totalYoungGen).toBe(37888);
                    expect(loadFileResult.objs[0].totalUsedPrior).toBe(31459);
                    expect(loadFileResult.objs[0].totalUsedAfter).toBe(17976);
                    expect(loadFileResult.objs[0].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[0].time).toBe(0.0128589);
                    expect(loadFileResult.objs[0].fileKey).toBe("c97cc4e21d13740626593d8c2bb29d4a");
                    //second entry
                    expect(loadFileResult.objs[1].timeStamp).toBe(26.708);
                    expect(loadFileResult.objs[1].dateStamp).toBe(Date.parse('2014-12-27T18:15:35.099'));
                    expect(loadFileResult.objs[1].youngGenUsedPrior).toBe(35995);
                    expect(loadFileResult.objs[1].youngGenUsedAfter).toBe(5088);
                    expect(loadFileResult.objs[1].totalYoungGen).toBe(37888);
                    expect(loadFileResult.objs[1].totalUsedPrior).toBe(48867);
                    expect(loadFileResult.objs[1].totalUsedAfter).toBe(46760);
                    expect(loadFileResult.objs[1].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[1].time).toBe(0.0145684);
                    expect(loadFileResult.objs[1].fileKey).toBe("c97cc4e21d13740626593d8c2bb29d4a");
                    //third entry
                    expect(loadFileResult.objs[2].timeStamp).toBe(28.229);
                    expect(loadFileResult.objs[2].dateStamp).toBe(Date.parse('2014-12-27T18:15:36.619'));
                    expect(loadFileResult.objs[2].youngGenUsedPrior).toBe(36823);
                    expect(loadFileResult.objs[2].youngGenUsedAfter).toBe(5088);
                    expect(loadFileResult.objs[2].totalYoungGen).toBe(37888);
                    expect(loadFileResult.objs[2].totalUsedPrior).toBe(78495);
                    expect(loadFileResult.objs[2].totalUsedAfter).toBe(77488);
                    expect(loadFileResult.objs[2].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[2].time).toBe(0.0155940);
                    expect(loadFileResult.objs[2].fileKey).toBe("c97cc4e21d13740626593d8c2bb29d4a");
                });

        it('verify conversion of full gc entry to gcEvent object', function () {
            //forth entry (Full GC)
            expect(loadFileResult.objs[3].timeStamp).toBe(28.245);
            expect(loadFileResult.objs[3].dateStamp).toBe(Date.parse('2014-12-27T18:15:36.635'));
            expect(loadFileResult.objs[3].youngGenUsedPrior).toBe(5088);
            expect(loadFileResult.objs[3].youngGenUsedAfter).toBe(0);
            expect(loadFileResult.objs[3].totalYoungGen).toBe(37888);
            expect(loadFileResult.objs[3].totalUsedPrior).toBe(77488);
            expect(loadFileResult.objs[3].totalUsedAfter).toBe(77258);
            expect(loadFileResult.objs[3].totalHeap).toBe(186880);
            expect(loadFileResult.objs[3].time).toBe(0.0415384);
            expect(loadFileResult.objs[3].fileKey).toBe("c97cc4e21d13740626593d8c2bb29d4a");
        });

        it('verify conversion of minor gc entry after full gc to gcEvent object', function () {
            //sixth entry - after full gc
            expect(loadFileResult.objs[4].timeStamp).toBe(29.792);
            expect(loadFileResult.objs[4].dateStamp).toBe(Date.parse('2014-12-27T18:15:38.183'));
            expect(loadFileResult.objs[4].youngGenUsedPrior).toBe(31909);
            expect(loadFileResult.objs[4].youngGenUsedAfter).toBe(4288);
            expect(loadFileResult.objs[4].totalYoungGen).toBe(37888);
            expect(loadFileResult.objs[4].totalUsedPrior).toBe(109168);
            expect(loadFileResult.objs[4].totalUsedAfter).toBe(108171);
            expect(loadFileResult.objs[4].totalHeap).toBe(186880);
            expect(loadFileResult.objs[4].time).toBe(0.0113512);
            expect(loadFileResult.objs[4].fileKey).toBe("c97cc4e21d13740626593d8c2bb29d4a");
        })
    });
});