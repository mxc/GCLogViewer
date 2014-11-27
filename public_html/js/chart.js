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
app.factory('Chart', function () {
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
        this.labelStrokeWidth = 2;
        this.svgns = "http://www.w3.org/2000/svg";
        this.xlinkns = 'http://www.w3.org/1999/xlink';
        this.offset = 30;
        this.chartWidth = this.labels ? this.width - this.offset : width;
        this.chartHeight = this.labels ? this.height - this.offset : this.height;
        this.id = obj.id === undefined ? Date.now() : obj.id;
        this.title = obj.title === undefined ? "No Title" : obj.title;
    }
    ;
    Chart.prototype.zoom = function (event) {
        if (event.deltaY > 0) {
            this.currentZoomFactor *= this.zoomRate;
        } else {
            this.currentZoomFactor /= this.zoomRate;
        }
        console.log(this.currentZoomFactor);
        var svg = document.querySelector("#" + this.id);
        svg.currentScale = this.currentZoomFactor;
        event.stopPropagation();
        event.preventDefault();
    };
    Chart.prototype.renderLabels = function () {
        //create the x and y axii
        var g = document.querySelector("#" + this.id + ">.wrapper");
        var xAxis = document.createElementNS(this.svgns, "line");
        xAxis.setAttribute("x1", this.offset);
        xAxis.setAttribute("y1", this.chartHeight);
        xAxis.setAttribute("x2", this.chartWidth + this.offset);
        xAxis.setAttribute("y2", this.chartHeight);
        xAxis.setAttribute("stroke", "black");
        xAxis.setAttribute("stroke-width", this.labelStrokeWidth);
        var yAxis = document.createElementNS(this.svgns, "line");
        yAxis.setAttribute("x1", this.offset);
        yAxis.setAttribute("y1", this.chartHeight);
        yAxis.setAttribute("x2", this.offset);
        yAxis.setAttribute("y2", 0);
        yAxis.setAttribute("stroke", "black");
        yAxis.setAttribute("stroke-width", this.labelStrokeWidth);
        g.appendChild(xAxis);
        g.appendChild(yAxis);
        //create the tick marks for axii
        var spacing = 20;
        var tickCount = parseInt(this.chartWidth / spacing); //a tick evert x "pixels"
        var interval = parseInt(this.data.maxx / tickCount) + 1;
        for (var i = 0; i <= tickCount; i++) {
            //x tick mark
            var tickx = document.createElementNS(this.svgns, "line");
            tickx.setAttribute("x1", (spacing * i) + this.offset);
            tickx.setAttribute("y1", this.chartHeight);
            tickx.setAttribute("x2", (spacing * i) + this.offset);
            tickx.setAttribute("y2", this.chartHeight - (this.offset / 2));
            tickx.setAttribute("stroke", "black");
            tickx.setAttribute("stroke-width", this.labelStrokeWidth);
            //create xtick mark label
            var tickTextX = document.createElementNS(this.svgns, "text");
            var text = document.createTextNode(formatNumber(interval * i));
            tickTextX.appendChild(text);
            tickTextX.setAttribute("x", (spacing * i) + this.offset);
            tickTextX.setAttribute("y", this.height);
            tickTextX.setAttribute("style", "font-size:8pt;");
            tickTextX.setAttribute("transform", "rotate(-45 " + ((spacing * i) + (this.offset / 2)) + " " + (this.height + this.offset / 2) + ")");
            g.appendChild(tickx);
            g.appendChild(tickTextX);
        }

        tickCount = parseInt(this.chartHeight / spacing) + 1; //a tick evert 5 "pixels"
        interval = parseInt(this.data.maxy / tickCount);
        for (var i = 0; i <= tickCount; i++) {
            //create y tick mark
            var ticky = document.createElementNS(this.svgns, "line");
            ticky.setAttribute("x1", this.offset);
            ticky.setAttribute("y1", this.chartHeight - (spacing * i));
            ticky.setAttribute("x2", this.offset + 10);
            ticky.setAttribute("y2", this.chartHeight - (spacing * i));
            ticky.setAttribute("stroke", "black");
            ticky.setAttribute("stroke-width", this.labelStrokeWidth);
            g.appendChild(ticky);
            //create y tick mark label
            var tickTextY = document.createElementNS(this.svgns, "text");
            var text = document.createTextNode(formatNumber(interval * i));
            tickTextY.appendChild(text);
            tickTextY.setAttribute("x", 0);
            tickTextY.setAttribute("style", "font-size:8pt;");
            tickTextY.setAttribute("y", this.chartHeight - (spacing * i));
            g.appendChild(tickTextY);
        }
    };
    Chart.prototype.render = function () {
        var xscale = this.chartWidth / this.data.maxx;
        var yscale = this.chartHeight / this.data.maxy;
        var elm = document.querySelector(this.element);
        if (elm.childNodes !== null) {
            while (elm.childNodes.length > 0) {
                elm.removeChild(elm.childNodes[0]);
            }
        }
        //setup svg
        var svg = document.createElementNS(this.svgns, "svg");
        elm.appendChild(svg);
        svg.setAttributeNS(null, "width", this.width);
        svg.setAttributeNS(null, "height", this.height);
        svg.setAttributeNS(null, "id", this.id);
        var gwrapper = document.createElementNS(this.svgns, "g");
        gwrapper.setAttribute("class", "wrapper");
        var g = document.createElementNS(this.svgns, "g");
        g.setAttribute("class", "chart");
        g.setAttribute("transform", "translate(" + this.offset + " 0)");
        gwrapper.appendChild(g);
        svg.appendChild(gwrapper);
        g.currentScale = 1;
        var self = this;
        g.addEventListener('wheel', self.zoom.bind(self));
        for (var i = this.series.length - 1; i >= 0; i--) {
            var value = this.series[i];
            var path = document.createElementNS(this.svgns, "path");
            var d = "M 0 " + this.chartHeight;
            value.data.forEach(function (dataPoint, index, array) {
                d += " L " + dataPoint.x * xscale + " " + (self.chartHeight - (dataPoint.y * yscale));
            });
            d += " L " + this.chartWidth + " " + this.chartHeight;
            path.setAttributeNS(null, "d", d);
            path.setAttributeNS(null, "fill", value.colour);
            g.appendChild(path);
        }
        ;
        if (this.labels) {
            this.renderLabels();
        }

        if (this.legend) {
            this.renderLegend();
        }
    };
    Chart.prototype.renderLegend = function () {
        var elm = document.querySelector(this.element);
        var legend = document.createElement("div");
        legend.setAttribute("class","legend");
        elm.appendChild(legend);
        var list = document.createElement("ul");
        legend.appendChild(list);
        this.series.forEach(function (value) {
            var item = document.createElement("li");
            var text = document.createTextNode(value.name);
            item.appendChild(text);
            item.setAttribute("style", "background-color:" + value.colour + ";");
            list.appendChild(item);
        });
    };
    function drawChart(db, chartNodeId, hasLegend) {
        db.getDataPoints(function (array) {
            if (array === 'undefined' || !Array.isArray(array) || array.length === 0) {
                var span = document.createElement("span");
                var textNode = document.createTextNode("No records found");
                span.setAttribute("style", "color:red");
                span.appendChild(textNode);
                document.querySelector(chartNodeId).appendChild(span);
                return;
            }
            var worker = new Worker('js/worker.js');
            worker.onerror = function (e) {
                console.log(e);
            };
            worker.onsuccess = function (e) {
                console.log(e);
            };
            worker.addEventListener('message', function (e) {
                var chart = new Chart({
                    element: chartNodeId,
                    width: document.body.clientWidth,
                    height: 800,
                    data: e.data,
                    legend: hasLegend,
                    title: "Total Heap",
                    id: "totalHeap"
                });
                chart.render();
            });
            worker.postMessage(array);
        });
    }
    ;
    function formatNumber(text) {
        text = text.toString();
        var i = text.length;
        var string = "";
        var j = -1;
        while (i > -1) {
            string += text.charAt(i);
            j++;
            if (j === 3 && i !== 0) {
                string += ",";
                j = 0;
            }
            i--;
        }
        string = string.split("").reverse().join("");
        return string;
    }

    return {
        //Chart: Chart,
        drawChart: drawChart
    }
});