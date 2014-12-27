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

    /*
     * Constructor function
     */
    function Chart(obj) {
        this.container = obj.container;
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
        this.titleOffset = 30;
        this.padding = 20;
        this.id = obj.id === undefined ? Date.now() : obj.id;
    }
    ;
    var rowCounter = 0;
    var tableCounter = 0;
    var charts = {};
    var currentDraggedChart;
    var previousParent;//used to track the previous parent of currentDraggedChart
    //needed for when the chart is dropped in a non drop zone. into a new row

    function clearCharts() {
        var elms = document.getElementsByClassName("chart-table");
        _.each(elms, function (value) {
            value.parentElement.removeChild(value)
        });
        charts = {};
        rowCounter = 0;
    }

    function createNewTable(container) {
        var table = document.createElement("div");
        table.setAttribute("id", "chart-table-" + tableCounter);
        tableCounter++;
        table.classList.add("chart-table");
        container.appendChild(table);
        return table;
    }

    function createNewRow(table) {
        var row = document.createElement("div");
        row.setAttribute("class", "chart-row");
        row.setAttribute("id", "chart-row-" + rowCounter);
        rowCounter++;
        table.appendChild(row);
        return row;
    }


    function cloneRow(row) {
        var rowClone = document.createElement("div");
        setPosition(row, rowClone);
        rowClone.classList.add("hide");
        rowClone.classList.add("clone");
        rowClone.setAttribute("id", row.getAttribute("id") + "-clone");
        row.parentElement.appendChild(rowClone);
        return rowClone;
    }

    function setPosition(row, rowClone) {
        var left = row.offsetLeft - row.scrollLeft;
        var top = row.offsetTop - row.scrollTop;
        var width = row.offsetWidth;
        var height = row.offsetHeight;
        rowClone.setAttribute("style", "position:absolute; top:" + top + "px; left:" + left + "px; height:" + height + "px; width:" + width + "px;");
    }

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
            var text = document.createTextNode(this.formatNumber(((interval * i) / 1000).toFixed(3)));
            tickTextX.appendChild(text);
            tickTextX.setAttribute("x", (spacing * i) + this.offset);
            tickTextX.setAttribute("y", this.chartHeight + this.offset+15);
            tickTextX.setAttribute("style", "font-size:8pt;");
            tickTextX.setAttribute("transform", "rotate(-45 " + ((spacing * i)+10) + " " + (this.chartHeight + (this.offset*1.5)) + ")");
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
            var text = document.createTextNode(this.formatNumber(((interval * i)/1000).toFixed(2)));
            tickTextY.appendChild(text);
            tickTextY.setAttribute("x",0);
            tickTextY.setAttribute("style", "font-size:8pt;");
            tickTextY.setAttribute("y", this.chartHeight - (spacing * i));
            g.appendChild(tickTextY);
        }
    };
    function zoomAll(ratio) {
        var svgs = document.querySelectorAll("svg");
        for (var i = 0; i < svgs.length; i++) {
            svgs[i].currentScale = ratio;
        }
    }


//Calculate the width for the chart.
//If there is a width style read that in. Otherwise set the width to
//document.offsetWidth less 80 pixels;
//If the style width is set, see if it is a percentage figure. If so then
//calculate the svg width as a percentage of the body.offsetWidth
    function calcWidth(measure) {
        if (measure === "" || measure === undefined || measure === null) {
            measure = this.getDefaultRowWidth();
        } else if (measure.indexOf("%") !== -1) {
            measure = (window.innerWidth - 50) * parseFloat(measure) / 100.0;
        }
        return measure;
    }
    ;

    function calcHeight(measure) {
        if (measure === "" || measure === undefined || measure === null) {
            measure = this.getDefaultRowWidth();
        } else if (measure.indexOf("%") !== -1) {
            measure = (window.innerHeight - 240) * parseFloat(measure) / 100.0;
        }
        return measure;
    }
    ;


    //Recalc the chart widths when a new chart is dropped into the target
    //row. Also recalc the chart heigths
    function resizeCharts(row, width, height) {
        //hardcode table row width and height
        //this is to prevent complications with resizing
        //on graph move.
        var svgs = row.getElementsByTagName("svg");
        var len = svgs.length;
        if (len === 0) {
            return;
        }
        if (len > 1) {
            width -= (20 * len);
        } else {
            width -= 40;
        }
        if (svgs !== undefined && svgs !== null) {
            for (var i = 0; i < svgs.length; i++) {
                svgs[i].setAttribute("width", (width / len));
                svgs[i].setAttribute("height", (height / len));
            }
        }
    }


    function getRealRow(cloneRow) {
        var id = cloneRow.getAttribute("id");
        id = id.substring(0, id.lastIndexOf("-clone"));
        return document.getElementById(id);
    }


    function addEventListenersToRow(row, self) {
        row.addEventListener("dragenter", function (e) {
            console.log("dragenter");
            var chart = charts[currentDraggedChart.getAttribute("id")];
            if (currentDraggedChart.parentElement !== null) {
                var source = currentDraggedChart.parentElement;
                source.removeChild(currentDraggedChart);
                resizeCharts(source, chart.width, chart.height);
            }

            var target = getRealRow(row);
            target.appendChild(currentDraggedChart);
            resizeCharts(target, chart.width, chart.height);
            previousParent = target;//used to keep track of previous parent
            e.preventDefault();
            return false;
        });

        row.addEventListener("dragleave", function (e) {
            console.log("dragleave");
            var chart = charts[currentDraggedChart.getAttribute("id")];
            var realrow = getRealRow(row);
            if (currentDraggedChart.parentElement === realrow) {
                realrow.removeChild(currentDraggedChart);
            }
            resizeCharts(realrow, chart.width, chart.height);
            e.preventDefault();
            return false;
        });

        row.addEventListener("dragover", function (e) {
            e.preventDefault();
            return false;
        });

        row.addEventListener("drop", function (e) {
            console.log("drop");
            var target = getRealRow(row);
            var elm = document.querySelector("#" + e.dataTransfer.getData("text/plain"));
            console.log("dropped=" + elm);
            var source = elm.parentElement;
            source.removeChild(elm);
            target.appendChild(elm);
            var width = self.width;
            var height = self.height;
            //resize graphs in target table
            resizeCharts(target, width, height, null);
            //resize graphs in source table
            //requery to get the children of original source
            //svgs = source.querySelectorAll("svg");
            resizeCharts(source, width, height, null);
            // setFooter();
            previousParent = null;
            cleanUpChartTables();
            e.preventDefault();
            return false;
        });
    }

    function cleanUpChartTables() {
        //unset the row height set in dragstart and dragenter
        var tables = document.getElementsByClassName("chart-table");
        //fix table row heights
        _.each(tables, function (table) {
            table.setAttribute("style", "");
            var rows = table.getElementsByClassName("chart-row");
            _.each(rows, function (row) {
                var height = row.offsetHeight;
                row.setAttribute("style", "");
                var cells = row.getElementsByClassName("chart");
                _.each(cells, function (cell) {
                    cell.setAttribute("style", "");
                });
            });
        });
        //remove empty charts divs created by dropping charts into body
        var chartdivs = document.querySelectorAll(".charts");
        for (var i = 0; i < chartdivs.length; i++) {
            var tmpsvgs = chartdivs[i].querySelectorAll("svg");
            if (tmpsvgs.length === 0) {
                chartdivs[i].parentElement.removeChild(chartdivs[i]);
            }
        }
        //remove empty rows
        var elms = document.querySelectorAll(".chart-table");
        for (var i = 0; i < elms.length; i++) {
            var charts = elms[i].getElementsByClassName("chart");
            if (charts.length === 0) {
                elms[i].parentElement.removeChild(elms[i]);
            }
        }
        //reposition masks
        var masks = document.querySelectorAll(".clone");
        for (var i = 0; i < masks.length; i++) {
            setPosition(masks[i].parentElement, masks[i]);
        }
    }

    //Enable the mask for drag and drop
    Chart.prototype.enableMasks = function (move) {
        currentDraggedChart = move.parentElement;
        var tables = document.getElementsByClassName("chart-table");
        //fix table row heights
        _.each(tables, function (table) {
            table.setAttribute("style", "table-layout:fixed");
            var rows = table.getElementsByClassName("chart-row");
            _.each(rows, function (row) {
                var height = row.offsetHeight;
                row.setAttribute("style", "height:" + height + "px;");
                var cells = row.getElementsByClassName("chart");
                _.each(cells, function (cell) {
                    cell.setAttribute("style", "overflow:hidden;white-space:nowrap;");
                });
            });
        });

        console.log("currentDraggedChart=" + move.parentElement);
        var itr = document.createNodeIterator(document.body, NodeFilter.SHOW_ELEMENT, {acceptNode: function (node) {
                if (node.classList.contains('clone') /*&& node.getAttribute("id") !== move.parentElement.parentElement.getAttribute("id") + "-clone"*/) {
                    return NodeFilter.FILTER_ACCEPT;
                } else {
                    return NodeFilter.FILTER_REJECT;
                }
            }});
        var current;
        while (current = itr.nextNode()) {
            current.classList.remove("hide");
        }
    };

    Chart.prototype.disableMasks = function () {
        var clones = document.getElementsByClassName("clone");
        for (var i = 0; i < clones.length; i++) {
            clones[i].classList.add("hide");
        }
    };

    Chart.prototype.render = function () {
        this.width = this.getDefaultRowWidth();
        this.height = this.getDefaultRowHeight();
        //is there a axis
        this.chartWidth = this.width - this.padding;
        this.chartWidth = this.labels ? this.chartWidth - this.offset : this.chartWidth;
        //is there a x axis
        this.chartHeight = this.labels ? this.height - this.offset : this.height;
        //is there a title
        this.chartHeight = this.title ? this.chartHeight - (this.titleOffset) : this.height;
        var xscale = this.chartWidth / this.data.maxx;
        var yscale = this.chartHeight / this.data.maxy;

        //setup new table, row and cell to contain chart
        var table = createNewTable(container);
        var row = createNewRow(table);
        //container.appendChild(row);
        var self = this;
        //setup div that 
        var chart = document.createElement("div");
        row.appendChild(chart);
        chart.setAttribute("id", this.id);
        chart.setAttribute("class", "chart");
        //setup close button for chart
        var close = document.createElement("a");
        close.setAttribute("href", "#");
        close.classList.add("close");
        close.classList.add("clickable");
        close.appendChild(document.createTextNode("\u00D7"));
        close.addEventListener("click", function (e) {
            e.preventDefault();
            var tmpNode = this.parentElement.parentElement;
            //var width = self.calcWidth(tmpNode);
            //var height = self.calcHeight(tmpNode);
            tmpNode.removeChild(this.parentElement);
            resizeCharts(tmpNode, self.width, self.height);
            delete charts[this.parentElement.getAttribute("id")];
            //show content if there are no graphs
            if (Object.keys(charts).length === 0) {
                var elms = document.getElementsByClassName("blurb");
                _.each(elms, function (value) {
                    value.setAttribute("style", "");
                });
            }
            cleanUpChartTables();
            return false;
        });
        chart.appendChild(close);
        //Setup move icon
        var move = document.createElement("a");
        move.setAttribute("href", "#");
        move.classList.add("close");
        move.classList.add("clickable");
        move.appendChild(document.createTextNode("\u2725"));
        move.setAttribute("draggable", true);
        move.addEventListener("click", function (e) {
            e.preventDefault();
        });

        //setup handling for when move icon is dragged
        move.addEventListener("dragstart", function (e) {
            console.log("dragstart");
            var image = document.createElement("img");
            image.setAttribute("src", "images/graph-line.svg");
            image.width = "10px";
            image.height = "10px";
            previousParent = move.parentElement.parentElement;
            e.dataTransfer.setDragImage(image, 0, 0);
            this.parentElement.style.opacity = 0.4;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.dropEffect = 'move';
            e.dataTransfer.setData('text/plain', this.parentElement.id);
            //if (BrowserDetect.browser !== 'Chrome') {
            self.enableMasks(move);
            //}
        });


        move.addEventListener("dragend", function (e) {
            console.log("dragend");
            this.parentElement.style.opacity = 1;
            currentDraggedChart = null;
            self.disableMasks();
            if (e.dataTransfer.dropEffect === 'none') {
                console.log("dragend = target is none");
                var table = createNewTable(self.container);
                var target = createNewRow(table);
                //add row table event handlers
                var chart = charts[this.parentElement.id];
                var source = previousParent;
                //unset style for row height
                source.setAttribute("style", "")
                target.appendChild(this.parentElement);
                var chart = charts[this.parentElement.getAttribute("id")];
                //resize source/target rows
                resizeCharts(target,
                        chart.width,
                        chart.height);
                resizeCharts(source,
                        chart.width,
                        chart.height);
                var clone = cloneRow(target);
                addEventListenersToRow(clone, chart);
                previousParent = null;
                currentDraggedChart = null;
                cleanUpChartTables();
                //setFooter();
            }
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
        //setup chart zooming. Needs some work.
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

        //render other stuff
        if (this.labels) {
            this.renderLabels();
        }

        if (this.title) {
            this.renderTitle();
        }

        if (this.legend) {
            this.renderLegend();
        }
        var clone = cloneRow(row);
        addEventListenersToRow(clone, this);
        //setFooter();
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
        text.setAttributeNS(null, "x", (this.width / 2) - (this.title.length*3));
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

    function drawChart(db, container, data, hasLegend) {
        db.findAllByMatch("gcEntry", data.index, data.key, function (e) {
            var array = e;
            if (array === 'undefined' || !Array.isArray(array) || array.length === 0) {
                var span = document.createElement("span");
                var textNode = document.createTextNode("No records found");
                span.setAttribute("style", "color:red");
                span.appendChild(textNode);
                container.appendChild(span);
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
                    container: container,
                    data: e.data,
                    legend: hasLegend,
                    subTitle: "Total Heap",
                    id: "chart" + Object.keys(charts).length,
                    title: data.host + " - " + data.title
                });
                chart.render();
                charts[chart.id] = chart;
            });
            worker.postMessage(array);
        });
    }


    Chart.prototype.getDefaultRowWidth = function () {
        return calcWidth(this.container.getAttribute("data-chart-row-width"));
    };

    Chart.prototype.getDefaultRowHeight = function () {
        return calcHeight(this.container.getAttribute("data-chart-row-height"));
    };

    Chart.prototype.formatNumber = function (text) {
        text = text.toString();
        var i = text.lastIndexOf(".");
        var string = text.substring(i, text.length).split("").reverse().join("");
        var j = -1;
        i--;
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
    };

    function setFooter() {
        var wrapper = document.getElementById("wrapper");
        var h = wrapper.style.height < window.innerHeight ? window.innerHeight : wrapper.style.height;
        if (h > wrapper.style.height) {
            var width = document.getElementById("footer").clientHeight;
            wrapper.setAttribute("style", "min-height:" + (h - width - 40) + "px");
        }
    }

    function onWindowResize() {
        setFooter();
        var rows = document.getElementsByClassName("chart-row");
        _.each(rows, function (row) {
            //find the container id for this row
            var container = row.parentElement.parentElement;
            //resize each row
            resizeCharts(row, calcWidth(this.container.getAttribute("data-chart-row-width")),
                    calcHeight(this.container.getAttribute("data-chart-row-height")))
        });
    }

    return {
        drawChart: drawChart,
        clear: clearCharts,
        zoom: zoomAll,
        setFooter: setFooter,
        windowResize: onWindowResize
    };
});