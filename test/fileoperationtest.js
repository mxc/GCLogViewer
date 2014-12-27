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

describe("GCLogViewer file.js function testing:", function () {
    
    var $q;
    var File;
    var $rootScope;
    
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

    describe('getFile function:', function () {
        it(' should return a filereader object and valid fileData object', function () {
            File.getFile(fileData).then(function (result) {
                expect(result.reader).not.toBe(undefined);
                expect(result.fileData.file.name).toBe('testfiles/gc-1.log');
                expect(result.fileData.host).toBe("test");
                expect(result.fileData.date).toBe('2015-01-22');
            });
            $rootScope.$apply();
        });
    });
});