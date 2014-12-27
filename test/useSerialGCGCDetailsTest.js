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

    //Note Full GC lines (last 2 lines) represent out of memory condition
    var gcDetailsParNewParOld = 'Java HotSpot(TM) 64-Bit Server VM (25.25-b02) for linux-amd64 JRE (1.8.0_25-b17), built on Sep 17 2014 17:32:11 by "java_re" with gcc 4.3.0 20080428 (Red Hat 4.3.0-8) \n' +
            'Memory: 4k page, physical 8139328k(1596156k free), swap 0k(0k free) \n' +
            'CommandLine flags: -XX:InitialHeapSize=130229248 -XX:+ManagementServer -XX:MaxHeapSize=2083667968 -XX:+PrintGC -XX:+PrintGCDateStamps -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+PrintTenuringDistribution -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseSerialGC \n' +
            '2014-12-27T17:31:42.677+0200: 57.806: [GC (Allocation Failure) 57.806: [DefNew \n' +
            'Desired survivor size 2195456 bytes, new threshold 1 (max 15) \n' +
            '- age   1:    3609776 bytes,    3609776 total \n' +
            ': 33655K->3525K(38720K), 0.0065844 secs] 33655K->11717K(124736K), 0.0066764 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] \n' +
            '2014-12-27T17:31:44.189+0200: 59.318: [GC (Allocation Failure) 59.318: [DefNew \n' +
            'Desired survivor size 2195456 bytes, new threshold 1 (max 15) \n' +
            '- age   1:    4213088 bytes,    4213088 total \n' +
            ': 36571K->4114K(38720K), 0.0157626 secs] 44763K->42433K(124736K), 0.0158628 secs] [Times: user=0.01 sys=0.01, real=0.01 secs] \n' +
            '2014-12-27T17:31:45.812+0200: 60.940: [GC (Allocation Failure) 60.940: [DefNew \n' +
            'Desired survivor size 2195456 bytes, new threshold 1 (max 15) \n' +
            '- age   1:    4194720 bytes,    4194720 total \n' +
            ': 37941K->4096K(38720K), 0.0134403 secs] 76261K->75202K(124736K), 0.0135358 secs] [Times: user=0.00 sys=0.00, real=0.01 secs] \n' +
            '2014-12-27T17:31:47.432+0200: 62.561: [GC (Allocation Failure) 62.561: [DefNew \n' +
            'Desired survivor size 2195456 bytes, new threshold 1 (max 15) \n' +
            '- age   1:    4194760 bytes,    4194760 total \n' +
            ': 38099K->4096K(38720K), 0.0210903 secs]62.582: [Tenured: 103874K->103874K(104484K), 0.0127900 secs] 109205K->107970K(143204K), [Metaspace: 7878K->7878K(1056768K)], 0.0341651 secs] [Times: user=0.03 sys=0.01, real=0.03 secs] \n' +
            '2014-12-27T17:35:47.621+0200: 302.749: [GC (Allocation Failure) 302.749: [DefNew: 605456K->605456K(610688K), 0.0000279 secs]302.750: [Tenured: 1232406K->1354260K(1357184K), 0.2638141 secs] 1837863K->1455641K(1967872K), [Metaspace: 7890K->7890K(1056768K)], 0.2639604 secs] [Times: user=0.19 sys=0.08, real=0.26 secs] \n' +
            '2014-12-27T17:36:10.090+0200: 325.219: [Full GC (Allocation Failure) 325.219: [Tenured: 1354260K->1354217K(1357184K), 0.3929162 secs] 1958589K->1947123K(1967872K), [Metaspace: 7890K->7890K(1056768K)], 0.3930093 secs] [Times: user=0.39 sys=0.00, real=0.39 secs] \n' +
            '2014-12-27T17:36:10.786+0200: 325.914: [Full GC (Allocation Failure) 325.914: [Tenured: 1354217K->1354217K(1357184K), 0.0143791 secs] 1962601K->1959411K(1967872K), [Metaspace: 7890K->7890K(1056768K)], 0.0145091 secs] [Times: user=0.02 sys=0.00, real=0.02 secs] ';

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




    describe("log file format with vm opts=gcDetails,UseSerialGC,PrintTenuringDistribution:", function () {

        it('verfiy correct number of entries have been converted to gcEvent objects', function () {
            expect(loadFileResult.objs.length).toBe(7);
        });

        it('verfiy conversion of minor gc entry to gcEvent object before full gc',
                function () {
                    //first entry
                    expect(loadFileResult.objs[0].dateStamp).toBe(Date.parse('2014-12-27T17:31:42.677'));
                    expect(loadFileResult.objs[0].timeStamp).toBe(57.806);
                    expect(loadFileResult.objs[0].youngGenUsedPrior).toBe(33655);
                    expect(loadFileResult.objs[0].youngGenUsedAfter).toBe(3525);
                    expect(loadFileResult.objs[0].totalYoungGen).toBe(38720);
                    expect(loadFileResult.objs[0].totalUsedPrior).toBe(33655);
                    expect(loadFileResult.objs[0].totalUsedAfter).toBe(11717);
                    expect(loadFileResult.objs[0].totalHeap).toBe(124736);
                    expect(loadFileResult.objs[0].time).toBe(0.0066764);
                    expect(loadFileResult.objs[0].fileKey).toBe("ed72fc0db3ad36ff1abcb2ef0ee08ae8");
                    //second entry
                    expect(loadFileResult.objs[1].timeStamp).toBe(59.318);
                    expect(loadFileResult.objs[1].dateStamp).toBe(Date.parse('2014-12-27T17:31:44.189'));
                    expect(loadFileResult.objs[1].youngGenUsedPrior).toBe(36571);
                    expect(loadFileResult.objs[1].youngGenUsedAfter).toBe(4114);
                    expect(loadFileResult.objs[1].totalYoungGen).toBe(38720);
                    expect(loadFileResult.objs[1].totalUsedPrior).toBe(44763);
                    expect(loadFileResult.objs[1].totalUsedAfter).toBe(42433);
                    expect(loadFileResult.objs[1].totalHeap).toBe(124736);
                    expect(loadFileResult.objs[1].time).toBe(0.0158628);
                    expect(loadFileResult.objs[1].fileKey).toBe("ed72fc0db3ad36ff1abcb2ef0ee08ae8");
                    //third entry
                    expect(loadFileResult.objs[2].timeStamp).toBe(60.940);
                    expect(loadFileResult.objs[2].dateStamp).toBe(Date.parse('2014-12-27T17:31:45.812'));
                    expect(loadFileResult.objs[2].youngGenUsedPrior).toBe(37941);
                    expect(loadFileResult.objs[2].youngGenUsedAfter).toBe(4096);
                    expect(loadFileResult.objs[2].totalYoungGen).toBe(38720);
                    expect(loadFileResult.objs[2].totalUsedPrior).toBe(76261);
                    expect(loadFileResult.objs[2].totalUsedAfter).toBe(75202);
                    expect(loadFileResult.objs[2].totalHeap).toBe(124736);
                    expect(loadFileResult.objs[2].time).toBe(0.0135358);
                    expect(loadFileResult.objs[2].fileKey).toBe("ed72fc0db3ad36ff1abcb2ef0ee08ae8");

                });

        it('verify conversion of full gc entry to gcEvent object', function () {

            //forth entry
            expect(loadFileResult.objs[3].timeStamp).toBe(62.561);
            expect(loadFileResult.objs[3].dateStamp).toBe(Date.parse('2014-12-27T17:31:47.432'));
            expect(loadFileResult.objs[3].youngGenUsedPrior).toBe(38099);
            expect(loadFileResult.objs[3].youngGenUsedAfter).toBe(4096);
            expect(loadFileResult.objs[3].totalYoungGen).toBe(38720);
            expect(loadFileResult.objs[3].totalUsedPrior).toBe(109205);
            expect(loadFileResult.objs[3].totalUsedAfter).toBe(107970);
            expect(loadFileResult.objs[3].totalHeap).toBe(143204);
            expect(loadFileResult.objs[3].time).toBe(0.0341651);
            expect(loadFileResult.objs[3].fileKey).toBe("ed72fc0db3ad36ff1abcb2ef0ee08ae8");

            //fith entry (full)
            expect(loadFileResult.objs[4].timeStamp).toBe(302.749);
            expect(loadFileResult.objs[4].dateStamp).toBe(Date.parse('2014-12-27T17:35:47.621'));
            expect(loadFileResult.objs[4].youngGenUsedPrior).toBe(605456);
            expect(loadFileResult.objs[4].youngGenUsedAfter).toBe(605456);
            expect(loadFileResult.objs[4].totalYoungGen).toBe(610688);
            expect(loadFileResult.objs[4].totalUsedPrior).toBe(1837863);
            expect(loadFileResult.objs[4].totalUsedAfter).toBe(1455641);
            expect(loadFileResult.objs[4].totalHeap).toBe(1967872);
            expect(loadFileResult.objs[4].time).toBe(0.2639604);
            expect(loadFileResult.objs[4].fileKey).toBe("ed72fc0db3ad36ff1abcb2ef0ee08ae8");
        });

    });
});