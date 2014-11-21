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
    this.width = obj.width === undefined ? 800 : obj.width;
    this.height = obj.height === undefined ? 800 : obj.height;
    this.data = obj.data;
    this.series = obj.data.series;
    this.zoomRate = 1.1;
    this.currentZoomFactor = 1;
    this.legend = obj.legend;
    this.labels = obj.labels === undefined ? true : obj.labels;
}
;

Chart.prototype.zoom = function (event) {
    if (event.deltaY > 0) {
        this.currentZoomFactor *= this.zoomRate;
    } else {
        this.currentZoomFactor /= this.zoomRate;
    }
    console.log(this.currentZoomFactor);
    var svg = document.querySelector("#chart>svg");
    svg.currentScale = this.currentZoomFactor;
    event.stopPropagation();
    event.preventDefault();
};


Chart.prototype.render = function () {
    var xscale = this.width / this.data.maxx;
    var yscale = this.height / this.data.maxy;
    var svgns = "http://www.w3.org/2000/svg";
    var xlinkns = 'http://www.w3.org/1999/xlink';

    var elm = document.querySelector(this.element);
    if (elm.firstChild !== null) {
        elm.removeChild(elm.firstChild);
    }
    //setup svg
    var svg = document.createElementNS(svgns, "svg");
    elm.appendChild(svg);
    svg.setAttributeNS(null, "width", this.width);
    svg.setAttributeNS(null, "height", this.height);
    svg.currentScale = 1;
    var self = this;
    svg.addEventListener('wheel', self.zoom.bind(self));

    for (var i = this.series.length - 1; i >= 0; i--) {
        var value = this.series[i];
        var path = document.createElementNS(svgns, "path");
        var d = "M 0 " + this.height;
        value.data.forEach(function (dataPoint, index, array) {
            d += " L " + dataPoint.x * xscale + " " + (self.height - (dataPoint.y * yscale));
        });
        d += " L " + this.width + " " + this.height;
        path.setAttributeNS(null, "d", d);
        path.setAttributeNS(null, "fill", value.colour);
        svg.appendChild(path);
    }
    ;

    if (this.labels) {
        var xAxis = document.createElementNS(svgns, "line");
        xAxis.setAttribute("x1", 0);
        xAxis.setAttribute("y1", this.height);
        xAxis.setAttribute("x2", this.width);
        xAxis.setAttribute("y2", this.height);
        xAxis.setAttribute("stroke", "black");
        xAxis.setAttribute("stroke-width", "5");
        var yAxis = document.createElementNS(svgns, "line");
        yAxis.setAttribute("x1", 0);
        yAxis.setAttribute("y1", this.height);
        yAxis.setAttribute("x2", 0);
        yAxis.setAttribute("y2", 0);
        yAxis.setAttribute("stroke", "black");
        yAxis.setAttribute("stroke-width", "5");
        svg.appendChild(xAxis);
        svg.appendChild(yAxis);

        var tickCount = parseInt(this.width /5);
        var interval = parseInt(this.data.maxx / tickCount);
        for (var i = 0; i < tickCount; i++) {
            var tickx = document.createElementNS(svgns, "line");
            tickx.setAttribute("x1", interval*i);
            tickx.setAttribute("y1", this.height);
            tickx.setAttribute("x2", interval*i);
            tickx.setAttribute("y2", this.height-10);
            tickx.setAttribute("stroke", "black");
            tickx.setAttribute("stroke-width", "3");
            
            var tickTextX = document.createElementNS(svgns, "text");
            var text = document.createTextNode(interval*i);
            tickTextX.appendChild(text);
            tickTextX.setAttribute("x",interval*i);
            tickTextX.setAttribute("y",this.height);
            tickTextX.setAttribute("transform","rotate(-45 "+ (interval*i) +" "+(this.height-10)+")");
            
            
            var ticky = document.createElementNS(svgns, "line");
            ticky.setAttribute("x1", 0);
            ticky.setAttribute("y1", this.height-(interval*i));
            ticky.setAttribute("x2", 10);
            ticky.setAttribute("y2", this.height-(interval*i));
            ticky.setAttribute("stroke", "black");
            ticky.setAttribute("stroke-width", "3");
            
            var tickTextY = document.createElementNS(svgns, "text");
            var text = document.createTextNode(interval*i);
            tickTextY.appendChild(text);
            tickTextY.setAttribute("x",0);
            tickTextY.setAttribute("y",this.height-(interval*i));
            
            svg.appendChild(tickx);
            svg.appendChild(ticky);
            svg.appendChild(tickTextX);
            svg.appendChild(tickTextY);
        }
    }

    if (this.legend !== undefined) {
        var legend = document.querySelector(this.legend);
        var list = document.createElement("ul");
        legend.appendChild(list);
        this.series.forEach(function (value) {
            var item = document.createElement("li");
            var text = document.createTextNode(value.name);
            item.appendChild(text);
            item.setAttribute("style", "background-color:" + value.colour + ";");
            list.appendChild(item);
        });
    }

};

function drawChart(db, chartNodeId, legendNodeId) {
    db.getDataPoints(function (array) {
        var worker = new Worker('js/worker.js');
        worker.addEventListener('message', function (e) {
            var chart = new Chart({
                element: chartNodeId,
                width: document.body.clientWidth,
                height: 800,
                data: e.data,
                legend: legendNodeId
            });
            chart.render();
        });
        worker.postMessage(array);
    });
}
;





