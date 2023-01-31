const MAX_BUCKETS = 20;
const MIN_BUCKETS = 1;
const stat = {};

/* Methods for computing quartiles are taken from http://en.wikipedia.org/wiki/Quartile */
/* Method for computing buckets is taken from http://en.wikipedia.org/wiki/Histogram#Number_of_bins_and_width - Freedman-Diaconis' choice is used */

function splitByMedian(data, method) {
    const n = data.length,
        middleIndex = Math.floor(n / 2),
        nIsOdd = n % 2;

    if (nIsOdd) {
        if (method === 'tuckey') {
            return {
                firstHalf: data.slice(0, middleIndex + 1),
                secondHalf: data.slice(middleIndex, n),
            };
        } else {
            return {
                firstHalf: data.slice(0, middleIndex),
                secondHalf: data.slice(middleIndex + 1, n),
            };
        }
    } else {
        return {
            firstHalf: data.slice(0, middleIndex),
            secondHalf: data.slice(middleIndex, n),
        };
    }
}

function findMedian(data) {
    const n = data.length,
        middleIndex = Math.floor(n / 2),
        nIsOdd = n % 2;

    if (nIsOdd) {
        return data[middleIndex];
    } else {
        return (data[middleIndex - 1] + data[middleIndex]) / 2;
    }
}

function findHistogramMedian(histogram) {
    const buckets = histogram.count;
    const min = histogram.min;
    const max = histogram.max;
    const n = buckets.length;

    if (n > 0 && max >= min) {
        const bucketSize = Math.floor((max - min) / n);
        let bucketIndex = 0;
        let partialBucketSum = 0;

        const fullBucketSum = _.reduce(
            buckets,
            (memo, bucket) => {
                memo += bucket;
                return memo;
            },
            0,
        );

        while (partialBucketSum < fullBucketSum / 2 && bucketIndex < n) {
            partialBucketSum += buckets[bucketIndex];
            bucketIndex++;
        }

        return min + bucketSize * bucketIndex;
    } else {
        return NaN;
    }
}

function computeHistogramQuartiles(histogram) {
    const buckets = histogram.count;
    const min = histogram.min;
    const max = histogram.max;
    const n = buckets.length;
    let q25;
    let q50;
    let q75;

    if (n > 0 && max >= min) {
        const bucketSize = Math.floor((max - min) / n);
        let bucketIndex = 0;
        let partialBucketSum = 0;

        const fullBucketSum = _.reduce(
            buckets,
            (memo, bucket) => {
                memo += bucket;
                return memo;
            },
            0,
        );

        const findNextQuartile = function (quartile) {
            while (partialBucketSum < quartile * fullBucketSum && bucketIndex < n) {
                partialBucketSum += buckets[bucketIndex];
                bucketIndex++;
            }

            return min + bucketSize * bucketIndex;
        };

        q25 = findNextQuartile(1 / 4);
        q50 = findNextQuartile(1 / 2);
        q75 = findNextQuartile(3 / 4);

        return {
            min: min,
            q25: q25,
            q50: q50,
            q75: q75,
            max: max,
        };
    } else {
        return {
            min: NaN,
            q25: NaN,
            q50: NaN,
            q75: NaN,
            max: NaN,
        };
    }
}

function computeQuartiles(data, method) {
    // Sort and copy data
    data = data.slice().sort(sortNumbers);

    // Calculate min and max
    const n = data.length;
    const dataMin = data[0];
    const dataMax = data[n - 1];
    const median = findMedian(data);
    let firstQuartile;
    let thirdQuartile;
    let splittedData;

    if (n === 1) {
        return {
            min: dataMin,
            q25: dataMin,
            q50: dataMin,
            q75: dataMin,
            max: dataMin,
        };
    }

    if (method === 'standard') {
        splittedData = splitByMedian(data);
        firstQuartile = findMedian(splittedData.firstHalf);
        thirdQuartile = findMedian(splittedData.secondHalf);
    } else if (method === 'tuckey') {
        splittedData = splitByMedian(data, 'tuckey');
        firstQuartile = findMedian(splittedData.firstHalf);
        thirdQuartile = findMedian(splittedData.secondHalf);
    } else if (method === 'combined') {
        // In combined method quartiles are always the mean of previous two methods;
        splittedData = splitByMedian(data);
        firstQuartile = findMedian(splittedData.firstHalf);
        thirdQuartile = findMedian(splittedData.secondHalf);

        splittedData = splitByMedian(data, 'tuckey');
        firstQuartile = (firstQuartile + findMedian(splittedData.firstHalf)) / 2;
        thirdQuartile = (thirdQuartile + findMedian(splittedData.secondHalf)) / 2;
    }

    return {
        min: dataMin,
        q25: firstQuartile,
        q50: median,
        q75: thirdQuartile,
        max: dataMax,
    };
}

function sortNumbers(a, b) {
    return a > b ? 1 : -1;
}

// PDF - probability density function
stat.pdf = function (data, settings) {
    settings = settings || {};
    // Sort and copy data
    data = data.slice().sort(sortNumbers);

    // Calculate min and max
    const n = data.length;
    const dataMin = data[0];
    const dataMax = data[n - 1];

    // Compute bucket size and buckets number
    const quartiles = computeQuartiles(data, 'combined');

    const IQR = quartiles.q75 - quartiles.q25;
    let bucketSize = settings.forcedBucketSize
        ? settings.forcedBucketSize
        : Math.max(Math.floor((2 * IQR) / Math.pow(n, 1 / 3)), 1);
    let numberOfBuckets = Math.max(Math.ceil((dataMax - dataMin + 1) / bucketSize), MIN_BUCKETS);

    if (numberOfBuckets > MAX_BUCKETS) {
        bucketSize = Math.ceil((numberOfBuckets * bucketSize) / MAX_BUCKETS);
        numberOfBuckets = MAX_BUCKETS;
    }

    // Compute buckets
    const buckets = [];
    let max = 0;
    let min = n;
    let j = 0;

    for (let i = 0; i < numberOfBuckets; i++) {
        const bucket = {
            start: dataMin + i * bucketSize,
            end: dataMin + (i + 1) * bucketSize,
            count: 0,
        };

        while (data[j] < bucket.end && data[j] >= bucket.start) {
            bucket.count = bucket.count + 1;
            j++;
        }

        max = Math.max(bucket.count, max);
        min = Math.min(bucket.count, min);

        buckets.push([bucket.start, bucket.count]);
    }

    return {
        quartiles: quartiles,
        min: dataMin,
        max: dataMax,
        valueMin: min,
        valueMax: max,
        bucketSize: bucketSize,
        bucketNumber: numberOfBuckets,
        buckets: buckets,
    };
};

// ECDF - empirical cumulative distribution function
stat.ecdf = function (data) {
    // Sort and copy data
    data = data.slice();

    const condencedData = _.uniq(data).sort(sortNumbers);
    const dataCounts = _.countBy(data);
    const n = data.length;

    // Calculate min and max
    const nCondenced = condencedData.length;
    const dataMin = condencedData[0];
    const dataMax = condencedData[nCondenced - 1];

    const steps = [];
    let point;
    let pointDataCount;
    let total = 0;

    for (let i = 0; i < nCondenced; i++) {
        point = condencedData[i];
        pointDataCount = dataCounts[point];

        steps.push([point, (100 * (pointDataCount + total)) / n]);

        total += pointDataCount;
    }

    return {
        min: dataMin,
        max: dataMax,
        steps: steps,
    };
};

stat.quartiles = function (data, method) {
    method = method || 'combined';
    return computeQuartiles(data, method);
};

stat.findHistogramMedian = findHistogramMedian;
stat.computeHistogramQuartiles = computeHistogramQuartiles;
stat.findMedian = findMedian;

export default stat;
