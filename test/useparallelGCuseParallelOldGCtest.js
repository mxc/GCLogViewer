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
            'Memory: 4k page, physical 8139304k(1987884k free), swap 0k(0k free)\n' +
            'CommandLine flags: -XX:InitialHeapSize=130228864 -XX:+ManagementServer -XX:MaxHeapSize=2083661824 -XX:+PrintGC -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseParallelGC -XX:+UseParallelOldGC\n' +
            '2014-11-15T17:30:16.695+0200: 26.359: [GC (Allocation Failure)  31460K->17920K(123904K), 0.0102289 secs]\n' +
            '2014-11-15T17:30:16.861+0200: 26.526: [GC (Allocation Failure)  49869K->48736K(123904K), 0.0180288 secs]\n' +
            '2014-11-15T17:30:17.036+0200: 26.700: [GC (Allocation Failure)  80035K->79488K(123904K), 0.0231706 secs]\n' +
            '2014-11-15T17:30:17.059+0200: 26.724: [Full GC (Ergonomics)  79488K->79287K(190976K), 0.0330431 secs] \n' +
            '2014-11-15T17:32:08.763+0200: 138.427: [GC (Allocation Failure)  112055K->83583K(222720K), 0.0032016 secs]\n' +
            '2014-11-15T17:36:32.819+0200: 402.483: [GC (Allocation Failure)  148607K->83519K(223232K), 0.0029225 secs]\n' +
            '2014-11-15T17:41:00.984+0200: 670.649: [GC (Allocation Failure)  148543K->83647K(328192K), 0.0043787 secs]\n' +
            '2014-11-15T17:46:30.943+0200: 1000.607: [GC (Allocation Failure)  211323K->128703K(329728K), 0.0267563 secs]\n' +
            '2014-11-15T17:46:37.094+0200: 1006.758: [GC (Allocation Failure)  255711K->253680K(497152K), 0.0960154 secs]\n' +
            '2014-11-15T17:46:37.190+0200: 1006.854: [Full GC (Ergonomics)  253680K->171479K(583168K), 0.0604523 secs]\n' +
            '2014-11-15T18:00:38.181+0200: 1847.845: [GC (Allocation Failure)  410071K->206551K(594432K), 0.0138438 secs]\n' +
            '2014-11-15T18:17:05.634+0200: 2835.298: [GC (Allocation Failure)  445143K->206559K(725504K), 0.0773905 secs]\n' +
            '2014-11-15T18:42:25.141+0200: 4354.805: [GC (Allocation Failure)  581855K->206487K(644096K), 0.0101585 secs]\n' +
            '2014-11-15T19:07:14.496+0200: 5844.160: [GC (Allocation Failure)  564887K->206431K(679936K), 0.0023996 secs]\n' +
            '2014-11-15T19:31:04.085+0200: 7273.749: [GC (Allocation Failure)  548959K->206431K(612864K), 0.0042914 secs]\n' +
            '2014-11-15T19:53:30.820+0200: 8620.484: [GC (Allocation Failure)  533599K->206463K(648704K), 0.0027577 secs] \n' +
            '2014-11-15T20:15:11.858+0200: 9921.522: [GC (Allocation Failure)  519295K->206447K(584704K), 0.0025481 secs] \r\n';

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




    describe("log file format with vm opts=!gcDetails,UseParallelGC,UseParallelOldGC:", function () {

        it('verfiy correct number of entries have been converted to gcEvent objects', function () {
            expect(loadFileResult.objs.length).toBe(17);
        });

        it('verfiy conversion of minor gc entry to gcEvent object before full gc',
                function () {
                    //first entry
                    expect(loadFileResult.objs[0].dateStamp).toBe(Date.parse('2014-11-15T17:30:16.695'));
                    expect(loadFileResult.objs[0].timeStamp).toBe(26.359);
                    expect(loadFileResult.objs[0].youngGenUsedPrior).toBe(undefined);
                    expect(loadFileResult.objs[0].youngGenUsedAfter).toBe(undefined);
                    expect(loadFileResult.objs[0].totalYoungGen).toBe(undefined);
                    expect(loadFileResult.objs[0].totalUsedPrior).toBe(31460);
                    expect(loadFileResult.objs[0].totalUsedAfter).toBe(17920);
                    expect(loadFileResult.objs[0].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[0].time).toBe(0.0102289);
                    expect(loadFileResult.objs[0].fileKey).toBe("0bb4eb6f5f63937585b009b3abdda7d7");
                    //second entry
                    expect(loadFileResult.objs[1].timeStamp).toBe(26.526);
                    expect(loadFileResult.objs[1].dateStamp).toBe(Date.parse('2014-11-15T17:30:16.861'));
                    expect(loadFileResult.objs[1].youngGenUsedPrior).toBe(undefined);
                    expect(loadFileResult.objs[1].youngGenUsedAfter).toBe(undefined);
                    expect(loadFileResult.objs[1].totalYoungGen).toBe(undefined);
                    expect(loadFileResult.objs[1].totalUsedPrior).toBe(49869);
                    expect(loadFileResult.objs[1].totalUsedAfter).toBe(48736);
                    expect(loadFileResult.objs[1].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[1].time).toBe(0.0180288);
                    expect(loadFileResult.objs[1].fileKey).toBe("0bb4eb6f5f63937585b009b3abdda7d7");
                    //third entry
                    expect(loadFileResult.objs[2].timeStamp).toBe(26.700);
                    expect(loadFileResult.objs[2].dateStamp).toBe(Date.parse('2014-11-15T17:30:17.036'));
                    expect(loadFileResult.objs[2].youngGenUsedPrior).toBe(undefined);
                    expect(loadFileResult.objs[2].youngGenUsedAfter).toBe(undefined);
                    expect(loadFileResult.objs[2].totalYoungGen).toBe(undefined);
                    expect(loadFileResult.objs[2].totalUsedPrior).toBe(80035);
                    expect(loadFileResult.objs[2].totalUsedAfter).toBe(79488);
                    expect(loadFileResult.objs[2].totalHeap).toBe(123904);
                    expect(loadFileResult.objs[2].time).toBe(0.0231706);
                    expect(loadFileResult.objs[2].fileKey).toBe("0bb4eb6f5f63937585b009b3abdda7d7");
                });

        it('verify conversion of full gc entry to gcEvent object', function () {
            //forth entry (Full GC)
            expect(loadFileResult.objs[3].timeStamp).toBe(26.724);
            expect(loadFileResult.objs[3].dateStamp).toBe(Date.parse('2014-11-15T17:30:17.059'));
            expect(loadFileResult.objs[3].youngGenUsedPrior).toBe(undefined);
            expect(loadFileResult.objs[3].youngGenUsedAfter).toBe(undefined);
            expect(loadFileResult.objs[3].totalYoungGen).toBe(undefined);
            expect(loadFileResult.objs[3].totalUsedPrior).toBe(79488);
            expect(loadFileResult.objs[3].totalUsedAfter).toBe(79287);
            expect(loadFileResult.objs[3].totalHeap).toBe(190976);
            expect(loadFileResult.objs[3].time).toBe(0.0330431);
            expect(loadFileResult.objs[3].fileKey).toBe("0bb4eb6f5f63937585b009b3abdda7d7");
        });

        it('verify conversion of minor gc entry after full gc to gcEvent object', function () {
            //sixth entry - after full gc
            expect(loadFileResult.objs[4].timeStamp).toBe(138.427);
            expect(loadFileResult.objs[4].dateStamp).toBe(Date.parse('2014-11-15T17:32:08.763'));
            expect(loadFileResult.objs[4].youngGenUsedPrior).toBe(undefined);
            expect(loadFileResult.objs[4].youngGenUsedAfter).toBe(undefined);
            expect(loadFileResult.objs[4].totalYoungGen).toBe(undefined);
            expect(loadFileResult.objs[4].totalUsedPrior).toBe(112055);
            expect(loadFileResult.objs[4].totalUsedAfter).toBe(83583);
            expect(loadFileResult.objs[4].totalHeap).toBe(222720);
            expect(loadFileResult.objs[4].time).toBe(0.0032016);
            expect(loadFileResult.objs[4].fileKey).toBe("0bb4eb6f5f63937585b009b3abdda7d7");
        })
    });
});