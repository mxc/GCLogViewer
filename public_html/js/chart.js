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
app.factory('Charts', function () {
    function Chart(obj) {
        this.container = obj.container;
        this.width = obj.width === undefined ? 800 : obj.width;
        this.height = obj.height === undefined ? 800 : obj.height;
        this.data = obj.data;
        this.title = obj.title === undefined ? "No Title" : obj.title;
        this.subTitle = obj.subTitle === undefined ? "" : obj.subTitle;
        this.series = obj.data.series;
        this.zoomRate = 1.1;
        this.currentZoomFactor = 1;
        this.legend = obj.legend;
        this.labels = obj.labels === undefined ? true : obj.labels;
        this.labelStrokeWidth = 2;
        this.svgns = "http://www.w3.org/2000/svg";
        this.xlinkns = 'http://www.w3.org/1999/xlink';
        this.offset = 40;
        this.titleOffset = 60;
        this.padding = 20;
        //is there a axis
        this.chartWidth = this.width - this.padding - 10;
        this.chartWidth = this.labels ? this.chartWidth - this.offset : this.chartWidth;
        //is there a x axis
        this.chartHeight = this.labels ? this.height - this.offset : this.height;
        //is there a title
        this.chartHeight = this.title ? this.chartHeight - (this.titleOffset) : this.height;
        this.id = obj.id === undefined ? Date.now() : obj.id;
    }
    ;

    Chart.prototype.zoom = function (event) {
        if (event.deltaY > 0) {
            this.currentZoomFactor *= this.zoomRate;
        } else {
            this.currentZoomFactor /= this.zoomRate;
        }
        var svg = document.querySelector("#" + this.id + " svg");
        svg.currentScale = this.currentZoomFactor;
        event.stopPropagation();
        event.preventDefault();
    };

    Chart.prototype.renderLabels = function () {
        //create the x and y axii
        var g = document.querySelector("#" + this.id + ">svg>.wrapper");
        //xAxis
        var xAxis = document.createElementNS(this.svgns, "line");
        xAxis.setAttribute("x1", this.offset);
        xAxis.setAttribute("y1", this.chartHeight);
        xAxis.setAttribute("x2", this.chartWidth + this.offset);
        xAxis.setAttribute("y2", this.chartHeight);
        xAxis.setAttribute("stroke", "black");
        xAxis.setAttribute("stroke-width", this.labelStrokeWidth);
        //yAxis
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
        var interval = parseInt(this.data.maxx / tickCount);
        //x labels
        //var xheight = this.title? this.height-this.titleOffset-30: this.height;
        for (var i = 0; i <= tickCount; i++) {
            //x tick mark
            var tickx = document.createElementNS(this.svgns, "line");
            tickx.setAttribute("x1", (spacing * i) + this.offset);
            tickx.setAttribute("y1", this.chartHeight);
            tickx.setAttribute("x2", (spacing * i) + this.offset);
            tickx.setAttribute("y2", this.chartHeight - (this.offset / 2));
            tickx.setAttribute("stroke", "black");
            tickx.setAttribute("stroke-width", this.labelStrokeWidth);
            //create xtick label
            var tickTextX = document.createElementNS(this.svgns, "text");
            var text = document.createTextNode(formatNumber(interval * i));
            tickTextX.appendChild(text);
            tickTextX.setAttribute("x", (spacing * i) + this.offset);
            tickTextX.setAttribute("y", this.chartHeight + this.offset);
            tickTextX.setAttribute("style", "font-size:8pt;");
            tickTextX.setAttribute("transform", "rotate(-45 " + ((spacing * i) + (this.offset)) + " " + (this.chartHeight + this.offset) + ")");
            g.appendChild(tickx);
            g.appendChild(tickTextX);
        }

        tickCount = parseInt(this.chartHeight / spacing); //a tick evert 5 "pixels"
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

    function clearCharts() {
        charts.forEach(function (chart) {
            var elm = document.querySelector("#" + chart.id);
            elm.parentNode.removeChild(elm);
        });
        charts.length = 0;
    }
    ;

    function zoom(ratio) {
        var svgs = document.querySelectorAll("svg");
        for (var i = 0; i < svgs.length; i++) {
            svgs[i].currentScale = ratio;
        }
        ;
    }
    ;

    function isAncestor(target, source) {
        while (source !== null && source !== document.body) {
            if (source.parentElement === target) {
                return true;
            } else {
                source = source.parentElement;
            }
        }
        return false;
    }

    function setPointerEvents(elms, enabled) {
        for (var i = 0; i < elms.length; i++) {
            if (enabled) {
                elms[i].classList.remove("disable-pointer-events");
            } else {
                elms[i].classList.add("disable-pointer-events");
            }
        }
        ;
    }

    function findSVGs(elm) {
        while (elm !== document.body) {
            if (elm.classList.contains("chart-table")) {
                console.log("found = " + elm.id);
                elm = document.querySelector("#" + elm.id);
                //console.log("found=" + elm.querySelectorAll("svg").length);
                return elm.querySelectorAll("svg");
            } else {
                //console.log(elm.id);
                elm = elm.parentElement;
            }
        }
        //console.log("not found");
        return undefined;
    }
    
    //Calculate the width for the chart.
    //If there is a width style read that in. Otherwise set the width to
    //document.offsetWidth less 80 pixels;
    //If the style width is set, see if it is a percentage figure. If so then
    //calculate the svg width as a percentage of the body.offsetWidth
    function calcWidth(elm) {
        var width = elm.style === undefined ?
                undefined :
                elm.style.width;
        if (width === "" || width === undefined || width === null) {
            width = getDefaultWidth();
        } else if (width.indexOf("%") !== -1) {
            width = document.body.offsetWidth * parseFloat(width) / 100.0;
        }
        return width;
    }
    
    function calcHeight(elm) {
        var height = elm.style === undefined ?
                undefined :
                elm.style.height;
        if (height === "" || height === undefined || height === null) {
            height = getDefaultHeight();
        } else if (height.indexOf("%") !== -1) {
            height = document.body.offsetHeight * parseFloat(height) / 100.0;
        }
        return height;
    }
    

    //Recalc the chart widths when a new chart is dropped into the target
    //row. Also recalc the chart heigths
    function resizeCharts(svgs, width,height) {
        if (svgs !== undefined && svgs !== null) {
            for (var i = 0; i < svgs.length; i++) {
                svgs[i].setAttribute("width", (width / svgs.length));
                svgs[i].setAttribute("height", (height / svgs.length));
            }
        }
    }

    Chart.prototype.render = function () {
        var xscale = this.chartWidth / this.data.maxx;
        var yscale = this.chartHeight / this.data.maxy;
        var elm = document.querySelector(this.container);
        //setup new table, row and cell to contain chart
        var table = document.createElement("div");
        table.setAttribute("id", "chart-table-" + this.id);
        table.classList.add("chart-table");

        var row = document.createElement("div");
        row.setAttribute("class", "chart-row");
        row.setAttribute("id", "chart-row-" + this.id);

        row.addEventListener("dragenter", function (e) {
            var elms = this.children;
            if (e.dataTransfer.getData("text")==="" || isAncestor(this, document.querySelector(e.dataTransfer.getData("text")))) {
                setPointerEvents(elms, true);
            } else {
                setPointerEvents(elms, false);
            }
            ;
            //this.classList.add("over");
        });

        row.addEventListener("dragleave", function (e) {
            //this.classList.remove("over");
            var elms = this.children;
            setPointerEvents(elms, true);
        });

        row.addEventListener("drop", function (e) {
            var elm = document.querySelector("#" + e.dataTransfer.getData("text"));
            var source = elm.parentElement;
            source.removeChild(elm);
            this.appendChild(elm);
            var width = calcWidth(elm.parentElement.parentElement);
            var height = calcHeight(elm.parentElement.parentElement);
            //resize graphs in target table
            var svgs = findSVGs(this);
            resizeCharts(svgs, width,height);
            svgs.length = 0;
            //resize graphs in source table
            //requery to get the children of original source
            resizeCharts(source.querySelectorAll("svg"), width,height);
        });

        row.addEventListener("dragover", function (e) {
            e.preventDefault();
        });
        table.appendChild(row);
        elm.appendChild(table);
        //setup div that 
        var chart = document.createElement("div");
        row.appendChild(chart);

        chart.setAttribute("id", this.id);
        chart.setAttribute("class", "chart");

        //setup close button for chart
        var close = document.createElement("a");
        close.setAttribute("href", "#");
        close.setAttribute("class", "close");
        close.appendChild(document.createTextNode("\u00D7"));
        close.addEventListener("click", function (e) {
            e.preventDefault();
            var tmpNode = this.parentElement.parentElement;
            var width = calcWidth(tmpNode);
            var height = calcHeight(tmpNode);
            var svgs = tmpNode.querySelectorAll("svg");
            svgs = _.toArray(svgs);
            var index = svgs.indexOf(this.parentElement);
            svgs.splice(index, 1);
            resizeCharts(svgs, width,height);
            tmpNode.removeChild(this.parentElement);
            return false;
        });
        chart.appendChild(close);
        var move = document.createElement("a");
        move.setAttribute("href", "#");
        move.setAttribute("class", "close");
        move.appendChild(document.createTextNode("\u2725"));
        move.setAttribute("draggable", true);
        move.addEventListener("click", function (e) {
            e.preventDefault();
        });
        move.addEventListener("dragstart", function (e) {
            this.style.opacity = 0.4;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData('text', this.parentElement.id);
        });
        move.addEventListener("dragend", function (e) {
            this.style.opacity = 1;
        });
        chart.appendChild(move);
        //setup svg
        var svg = document.createElementNS(this.svgns, "svg");
        chart.appendChild(svg);
        svg.setAttributeNS(null, "width", this.width);
        svg.setAttributeNS(null, "height", this.height);
        svg.setAttributeNS(null, "viewBox", "0 0 " + this.width + " " + this.height);
        //svg.setAttributeNS(null, "class", this.id);
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

        if (this.title) {
            this.renderTitle();
        }

        if (this.legend) {
            this.renderLegend();
        }
    };

    Chart.prototype.renderTitle = function () {
        var svg = document.querySelector("#" + this.id + " svg");
        var text = document.createElementNS(this.svgns, "text");
        text.setAttribute("font-family", "Arial");
        text.setAttribute("font-size", "18");
        text.setAttribute("fill", "black");
        var textNode = document.createTextNode(this.title);
        text.appendChild(textNode);
        svg.appendChild(text);
        text.setAttributeNS(null, "x", (this.width / 2) - this.title.length);
        text.setAttributeNS(null, "y", 18);
        svg.children[0].setAttributeNS(null, "transform", "translate(0 " + (this.titleOffset) + ")");
    };

    Chart.prototype.renderLegend = function () {
        var elm = document.querySelector("#" + this.id);
        var legend = document.createElement("div");
        legend.setAttribute("class", "legend");
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

    var charts = [];

    function drawChart(db, containerId, data, hasLegend) {
        db.findAll("gcEntry", data.index, data.key, function (e) {
            var array = e;
            if (array === 'undefined' || !Array.isArray(array) || array.length === 0) {
                var span = document.createElement("span");
                var textNode = document.createTextNode("No records found");
                span.setAttribute("style", "color:red");
                span.appendChild(textNode);
                document.querySelector(containerId).appendChild(span);
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
                    container: containerId,
                    width: getDefaultWidth(),
                    height: getDefaultHeight(),
                    data: e.data,
                    legend: hasLegend,
                    subTitle: "Total Heap",
                    id: "chart" + charts.length,
                    title: data.host + " - " + data.file
                });
                chart.render();
                charts.push(chart);
            });
            worker.postMessage(array);
        });
    };
    
    function getDefaultWidth(){
            return document.body.clientWidth - 80;        
    }
    
    function getDefaultHeight(){
        return 700;
    }

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
        drawChart: drawChart,
        clear: clearCharts,
        zoom: zoom
    };
});