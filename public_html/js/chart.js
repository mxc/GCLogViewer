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

function Chart(obj) {
    this.element = obj.element;
    this.width = obj.width;
    this.height = obj.height;
    this.data = obj.data;
    this.series = obj.data.data;
}
;


Chart.prototype.render = function () {
    var xscale = this.width / this.data.maxx;
    var yscale = this.height / this.data.maxy;
    var svgns = "http://www.w3.org/2000/svg";
    var xlinkns = 'http://www.w3.org/1999/xlink';

    var elm = document.querySelector(this.element);

    //setup svg
    var svg = document.createElementNS(svgns, "svg");
    elm.appendChild(svg);
    svg.setAttributeNS(null, "width", this.width);
    svg.setAttributeNS(null, "height", this.height);
    for(var i=this.series.length-1;i>=0;i--) {
        var value=this.series[i];        
        var path = document.createElementNS(svgns, "path");
        var d = "M 0 " + this.height;
        value.data.forEach(function (dataPoint, index, array) {
            d += " L " + dataPoint.x * xscale + " " + (800 - (dataPoint.y * yscale));
        });
        d += " L " +this.width + " " + this.height;
        path.setAttributeNS(null, "d", d);
        path.setAttributeNS(null, "fill",value.colour);
        svg.appendChild(path);
    };
};

function drawChart(db) {
    db.getDataPoints(function (array) {
        var worker = new Worker('js/worker.js');
        worker.addEventListener('message', function (e) {
            var graph = new Chart({
                element: "#chart",
                width: document.body.clientWidth,
                height: 800,
                data: e.data
            });
            graph.render();
        });
        worker.postMessage(array);
    });
}
;





