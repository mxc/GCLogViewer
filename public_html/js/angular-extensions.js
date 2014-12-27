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


app.directive("gcModelFile", function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attr) {
            elm.bind("change", function (changeevent) {
                scope[elm.attr('name')] = changeevent.target.files[0];
                scope.$apply();
            });
        }
    };
});

app.directive("gcModelDate", function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attr) {
            elm.bind("change", function (changeevent) {
                scope[elm.attr('name')] = changeevent.target.value;
                scope.$apply();
            });
        }
    };
});

app.directive('gcAutocomplete', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, controller) {
            scope.getOptions(function (opts) {
                element.autocomplete(opts);
            });
        }
    };
});