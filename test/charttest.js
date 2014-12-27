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
    
    var mockGCEvent = {};
    var mockModal = {};
    var $scope = {};
    var $window = {};

    beforeEach(function () {
        module('app');
        module(function ($provide) {
            dbMock = {
                init:function(){},
                newConnection:function(){}
            };
            $provide.value('db', dbMock);
        });
    });

    beforeEach(inject(function ($rootScope, _$controller_, _$q_) {
        $scope = $rootScope.$new();
        $controller = _$controller_;
        $q = _$q_;
    }));

    describe('Parsing gclog file lines', function () {
        var controller;

        beforeEach(function () {
            controller = $controller('GCLogViewerController', {
                $scope: $scope,
                $window: $window,
                $q: $q,
                GCViewerDB: mockGCViewerDB,
                Charts: mockCharts,
                GCEvent: mockGCEvent,
                $modal: mockModal});
        });

        it("should call parse text file", function () {
            //expect(false).toBe(true);
        });
    });

});
