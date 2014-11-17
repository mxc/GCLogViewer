function parseLogEntry(line) {
    var regex = /(?:(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d*)(?:\+\d*:\s))?(\d*\.\d*:\s)?\[.*?(?:\[.*?(\d+)K->(\d+)K\((\d+)K\)(?:,?\s\d*\.\d* secs)?\])?(?:\s(\d+)K->(\d+)K\((\d+)K\)),\s(\d+\.\d+) secs]/;
    var matches = line.match(regex);
    if (!matches) {
        return;
    }
    var dateStamp = matches[1];
    var timeStamp = matches[2];
    var youngGenUsedPrior = matches[3];
    var youngGenUsedAfter = matches[4];
    var totalYoungGen = matches[5];
    var totalUsedPrior = matches[6];
    var totalUsedAfter = matches[7];
    var totalHeap = matches[8];
    var time = matches[9];
    var data = new GCEvent(dateStamp, timeStamp,
            youngGenUsedPrior, youngGenUsedAfter, totalYoungGen,
            totalUsedPrior, totalUsedAfter, totalHeap, time);
    return data;
};

function GCEvent(dateStamp, timeStamp,
        youngGenUsedPrior, youngGenUsedAfter, totalYoungGen,
        totalUsedPrior, totalUsedAfter, totalHeap, time) {
    this.youngGenUsedBefore = parseInt(youngGenUsedPrior);
    this.timeStamp = parseFloat(timeStamp);
    if (dateStamp !== null) {
        this.dateStamp = Date.parse(dateStamp);
    }
    this.youngGenUsedAfter = parseInt(youngGenUsedAfter);
    this.totalYoungGen = parseInt(totalYoungGen);
    this.totalUsedPrior = parseInt(totalUsedPrior);
    this.totalUsedAfter = parseInt(totalUsedAfter);
    this.totalHeap = parseInt(totalHeap);
    this.time = parseFloat(time);
};
