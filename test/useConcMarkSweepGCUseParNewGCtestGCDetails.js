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

    //note entry edited to try and capture all permutations. Maybe missing some entries that cause issues. Will need more sample files to compare
    var gcDetailsParNewCMSOld = 'Java HotSpot(TM) 64-Bit Server VM (25.25-b02) for linux-amd64 JRE (1.8.0_25-b17), built on Sep 17 2014 17:32:11 by "java_re" with gcc 4.3.0 20080428 (Red Hat 4.3.0-8) \n' +
            'Memory: 4k page, physical 8139304k(2228532k free), swap 0k(0k free) \n' +
            'CommandLine flags: -XX:InitialHeapSize=130228864 -XX:+ManagementServer -XX:MaxHeapSize=2083661824 -XX:MaxNewSize=694157312 -XX:MaxTenuringThreshold=6 -XX:OldPLABSize=16 -XX:+PrintGC -XX:+PrintGCDateStamps -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseConcMarkSweepGC -XX:+UseParNewGC  \n' +
            '2014-11-15T17:28:25.911+0200: 12.509: [GC (Allocation Failure) 12.509: [ParNew: 32876K->3590K(38720K), 0.0129705 secs] 32876K->22039K(124736K), 0.0130841 secs] [Times: user=0.06 sys=0.00, real=0.02 secs]  \n' +
            '2014-11-15T17:28:42.388+0200: 28.986: [GC (Allocation Failure) 28.986: [ParNew: 36100K->3398K(38720K), 0.0107645 secs] 54549K->27567K(124736K), 0.0108429 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]  \n' +
            '2014-11-15T17:28:44.005+0200: 30.603: [GC (Allocation Failure) 30.604: [ParNew: 37456K->2387K(38720K), 0.0123768 secs] 61625K->59325K(124736K), 0.0124625 secs] [Times: user=0.06 sys=0.01, real=0.01 secs]  \n' +
            '2014-11-15T17:28:44.018+0200: 30.616: [GC (CMS Initial Mark) [1 CMS-initial-mark: 56937K(86016K)] 61373K(124736K), 0.0005711 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]  \n' +
            '2014-11-15T17:28:44.019+0200: 30.617: [CMS-concurrent-mark-start] \n' +
            '2014-11-15T17:28:44.022+0200: 30.620: [CMS-concurrent-mark: 0.003/0.003 secs] [Times: user=0.01 sys=0.00, real=0.01 secs]  \n' +
            '2014-11-15T17:28:44.022+0200: 30.620: [CMS-concurrent-preclean-start] \n' +
            '2014-11-15T17:28:44.023+0200: 30.621: [CMS-concurrent-preclean: 0.000/0.000 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]  \n' +
            '2014-11-15T17:28:44.023+0200: 30.621: [CMS-concurrent-abortable-preclean-start] \n' +
            ' CMS: abort preclean due to time 2014-11-15T17:28:49.026+0200: 35.624: [CMS-concurrent-abortable-preclean: 0.028/5.003 secs] [Times: user=0.08 sys=0.01, real=5.00 secs]  \n' +
            '2014-11-15T17:28:49.026+0200: 35.624: [GC (CMS Final Remark) [YG occupancy: 6855 K (38720 K)]35.624: [Rescan (parallel) , 0.0010907 secs]35.626: [weak refs processing, 0.0000157 secs]35.626: [class unloading, 0.0042991 secs]35.630: [scrub symbol table, 0.0008229 secs]35.631: [scrub string table, 0.0003808 secs][1 CMS-remark: 56937K(86016K)] 63792K(124736K), 0.0076740 secs] [Times: user=0.01 sys=0.00, real=0.01 secs]  \n' +
            '2014-11-15T17:28:49.034+0200: 35.632: [CMS-concurrent-sweep-start] \n' +
            '2014-11-15T17:28:49.035+0200: 35.633: [CMS-concurrent-sweep: 0.001/0.001 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] \n' +
            '2014-11-15T17:28:49.035+0200: 35.633: [CMS-concurrent-reset-start] \n' +
            '2014-11-15T17:28:49.039+0200: 35.637: [CMS-concurrent-reset: 0.004/0.004 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] \n' +
            '2014-11-15T17:29:05.139+0200: 51.737: [GC (CMS Initial Mark) [1 CMS-initial-mark: 38485K(86016K)] 49194K(124736K), 0.0018200 secs] [Times: user=0.01 sys=0.01, real=0.00 secs]  \n' +
            '2014-11-15T17:29:05.141+0200: 51.739: [CMS-concurrent-mark-start] \n' +
            '2014-11-15T17:29:05.143+0200: 51.741: [CMS-concurrent-mark: 0.002/0.002 secs] [Times: user=0.00 sys=0.00, real=0.01 secs] \n' +
            '2014-11-15T17:29:05.143+0200: 51.741: [CMS-concurrent-preclean-start] \n' +
            '2014-11-15T17:29:05.143+0200: 51.741: [CMS-concurrent-preclean: 0.000/0.000 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]  \n' +
            '2014-11-15T17:29:05.143+0200: 51.741: [CMS-concurrent-abortable-preclean-start] \n' +
            ' CMS: abort preclean due to time 2014-11-15T17:29:10.148+0200: 56.746: [CMS-concurrent-abortable-preclean: 0.029/5.005 secs] [Times: user=0.21 sys=0.00, real=5.00 secs]  \n' +
            '2014-11-15T17:29:10.148+0200: 56.746: [GC (CMS Final Remark) [YG occupancy: 12167 K (38720 K)]56.746: [Rescan (parallel) , 0.0045955 secs]56.751: [weak refs processing, 0.0000176 secs]56.751: [class unloading, 0.0039271 secs]56.755: [scrub symbol table, 0.0007794 secs]56.756: [scrub string table, 0.0003378 secs][1 CMS-remark: 38485K(86016K)] 50652K(124736K), 0.0105077 secs] [Times: user=0.03 sys=0.00, real=0.01 secs] \n' +
            '2014-11-15T17:29:10.159+0200: 56.757: [CMS-concurrent-sweep-start] \n' +
            '2014-11-15T17:29:10.160+0200: 56.758: [CMS-concurrent-sweep: 0.001/0.001 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]  \n' +
            '2014-11-15T17:29:10.160+0200: 56.758: [CMS-concurrent-reset-start] \n' +
            '2014-11-15T17:29:10.163+0200: 56.762: [CMS-concurrent-reset: 0.003/0.003 secs] [Times: user=0.01 sys=0.00, real=0.01 secs] \n' +
            '2014-11-15T17:30:50.851+0200: 157.449: [GC (CMS Initial Mark) [1 CMS-initial-mark: 38465K(86016K)] 75284K(124736K), 0.0086351 secs] [Times: user=0.05 sys=0.00, real=0.01 secs]  \n' +
            '2014-11-15T17:30:50.860+0200: 157.458: [CMS-concurrent-mark-start] \n' +
            '2014-11-15T17:30:50.863+0200: 157.461: [CMS-concurrent-mark: 0.003/0.003 secs] [Times: user=0.01 sys=0.00, real=0.01 secs] \n' +
            '2014-11-15T17:30:50.863+0200: 157.461: [CMS-concurrent-preclean-start] \n' +
            '2014-11-15T17:30:50.863+0200: 157.461: [CMS-concurrent-preclean: 0.000/0.000 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]  \n' +
            '2014-11-15T17:30:50.863+0200: 157.461: [CMS-concurrent-abortable-preclean-start] \n' +
            '2014-11-15T17:30:52.407+0200: 159.005: [GC (Allocation Failure) 159.006: [ParNew: 36819K->65K(38720K), 0.0011498 secs] 75284K->38530K(124736K), 0.0012381 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]  \n' +
            ' CMS: abort preclean due to time 2014-11-15T17:30:55.936+0200: 162.535: [CMS-concurrent-abortable-preclean: 0.034/5.073 secs] [Times: user=0.07 sys=0.01, real=5.07 secs]  \n' +
            '2014-11-15T17:30:55.937+0200: 162.535: [GC (CMS Final Remark) [YG occupancy: 1503 K (38720 K)]162.535: [Rescan (parallel) , 0.0013229 secs]162.536: [weak refs processing, 0.0000217 secs]162.536: [class unloading, 0.0038441 secs]162.540: [scrub symbol table, 0.0007870 secs]162.541: [scrub string table, 0.0003538 secs][1 CMS-remark: 38465K(86016K)] 39968K(124736K), 0.0072318 secs] [Times: user=0.00 sys=0.00, real=0.01 secs]  \n' +
            '2014-11-15T17:30:55.944+0200: 162.542: [CMS-concurrent-sweep-start] \n' +
            '2014-11-15T17:30:55.945+0200: 162.544: [CMS-concurrent-sweep: 0.001/0.001 secs] [Times: user=0.01 sys=0.00, real=0.00 secs] \n' +
            '2014-11-15T17:30:55.945+0200: 162.544: [CMS-concurrent-reset-start] \n' +
            '2014-11-15T17:30:55.949+0200: 162.547: [CMS-concurrent-reset: 0.004/0.004 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]  \n' +
            '2014-11-15T17:33:13.526+0200: 300.124: [GC (Allocation Failure) 300.124: [ParNew: 34497K->51K(38720K), 0.0011805 secs] 72962K->38517K(124736K), 0.0012605 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]  \n' +
            '2014-11-15T17:35:34.265+0200: 440.864: [GC (Allocation Failure) 440.864: [ParNew: 34483K->46K(38720K), 0.0010851 secs] 72949K->38511K(124736K), 0.0011611 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] ; \n';

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
            result: gcDetailsParNewCMSOld
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




    describe("log file format with vm opts=gcDetails,UseConcMarkSweepGC,UseParNewGC:", function () {

        it('verfiy correct number of entries have been converted to gcEvent objects', function () {
            expect(loadFileResult.objs.length).toBe(6);
        });

        it('verfiy conversion of minor gc entry to gcEvent object before full gc',
                function () {
                    //first entry
                    expect(loadFileResult.objs[0].dateStamp).toBe(Date.parse('2014-11-15T17:28:25.911'));
                    expect(loadFileResult.objs[0].timeStamp).toBe(12.509);
                    expect(loadFileResult.objs[0].youngGenUsedPrior).toBe(32876);
                    expect(loadFileResult.objs[0].youngGenUsedAfter).toBe(3590);
                    expect(loadFileResult.objs[0].totalYoungGen).toBe(38720);
                    expect(loadFileResult.objs[0].totalUsedPrior).toBe(32876);
                    expect(loadFileResult.objs[0].totalUsedAfter).toBe(22039);
                    expect(loadFileResult.objs[0].totalHeap).toBe(124736);
                    expect(loadFileResult.objs[0].time).toBe(0.0130841);
                    expect(loadFileResult.objs[0].fileKey).toBe("e825c65d13a6fe5fba3c2c40ec2e6541");
                    //second entry
                    expect(loadFileResult.objs[1].timeStamp).toBe(28.986);
                    expect(loadFileResult.objs[1].dateStamp).toBe(Date.parse('2014-11-15T17:28:42.388'));
                    expect(loadFileResult.objs[1].youngGenUsedPrior).toBe(36100);
                    expect(loadFileResult.objs[1].youngGenUsedAfter).toBe(3398);
                    expect(loadFileResult.objs[1].totalYoungGen).toBe(38720);
                    expect(loadFileResult.objs[1].totalUsedPrior).toBe(54549);
                    expect(loadFileResult.objs[1].totalUsedAfter).toBe(27567);
                    expect(loadFileResult.objs[1].totalHeap).toBe(124736);
                    expect(loadFileResult.objs[1].time).toBe(0.0108429);
                    expect(loadFileResult.objs[1].fileKey).toBe("e825c65d13a6fe5fba3c2c40ec2e6541");
                    //third entry
                    expect(loadFileResult.objs[2].timeStamp).toBe(30.603);
                    expect(loadFileResult.objs[2].dateStamp).toBe(Date.parse('2014-11-15T17:28:44.005'));
                    expect(loadFileResult.objs[2].youngGenUsedPrior).toBe(37456);
                    expect(loadFileResult.objs[2].youngGenUsedAfter).toBe(2387);
                    expect(loadFileResult.objs[2].totalYoungGen).toBe(38720);
                    expect(loadFileResult.objs[2].totalUsedPrior).toBe(61625);
                    expect(loadFileResult.objs[2].totalUsedAfter).toBe(59325);
                    expect(loadFileResult.objs[2].totalHeap).toBe(124736);
                    expect(loadFileResult.objs[2].time).toBe(0.0124625);
                    expect(loadFileResult.objs[2].fileKey).toBe("e825c65d13a6fe5fba3c2c40ec2e6541");
                    //forth entry
                    expect(loadFileResult.objs[3].timeStamp).toBe(159.005);
                    expect(loadFileResult.objs[3].dateStamp).toBe(Date.parse('2014-11-15T17:30:52.407'));
                    expect(loadFileResult.objs[3].youngGenUsedPrior).toBe(36819);
                    expect(loadFileResult.objs[3].youngGenUsedAfter).toBe(65);
                    expect(loadFileResult.objs[3].totalYoungGen).toBe(38720);
                    expect(loadFileResult.objs[3].totalUsedPrior).toBe(75284);
                    expect(loadFileResult.objs[3].totalUsedAfter).toBe(38530);
                    expect(loadFileResult.objs[3].totalHeap).toBe(124736);
                    expect(loadFileResult.objs[3].time).toBe(0.0012381);
                    expect(loadFileResult.objs[3].fileKey).toBe("e825c65d13a6fe5fba3c2c40ec2e6541");
                });

        it('verify conversion of full gc entry to gcEvent object', function () {
            //fith entry (Full GC)
            expect(loadFileResult.objs[4].timeStamp).toBe(300.124);
            expect(loadFileResult.objs[4].dateStamp).toBe(Date.parse('2014-11-15T17:33:13.526'));
            expect(loadFileResult.objs[4].youngGenUsedPrior).toBe(34497);
            expect(loadFileResult.objs[4].youngGenUsedAfter).toBe(51);
            expect(loadFileResult.objs[4].totalYoungGen).toBe(38720);
            expect(loadFileResult.objs[4].totalUsedPrior).toBe(72962);
            expect(loadFileResult.objs[4].totalUsedAfter).toBe(38517);
            expect(loadFileResult.objs[4].totalHeap).toBe(124736);
            expect(loadFileResult.objs[4].time).toBe(0.0012605);
            expect(loadFileResult.objs[4].fileKey).toBe("e825c65d13a6fe5fba3c2c40ec2e6541");
        });

        it('verify conversion of minor gc entry after full gc to gcEvent object', function () {
            //sixth entry - after full gc
            expect(loadFileResult.objs[5].timeStamp).toBe(440.864);
            expect(loadFileResult.objs[5].dateStamp).toBe(Date.parse('2014-11-15T17:35:34.265'));
            expect(loadFileResult.objs[5].youngGenUsedPrior).toBe(34483);
            expect(loadFileResult.objs[5].youngGenUsedAfter).toBe(46);
            expect(loadFileResult.objs[5].totalYoungGen).toBe(38720);
            expect(loadFileResult.objs[5].totalUsedPrior).toBe(72949);
            expect(loadFileResult.objs[5].totalUsedAfter).toBe(38511);
            expect(loadFileResult.objs[5].totalHeap).toBe(124736);
            expect(loadFileResult.objs[5].time).toBe(0.0011611);
            expect(loadFileResult.objs[5].fileKey).toBe("e825c65d13a6fe5fba3c2c40ec2e6541");
        })
    });
});