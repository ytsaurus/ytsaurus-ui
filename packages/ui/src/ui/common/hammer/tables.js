/*
  For theory behind the formulas see
  https://ru.wikipedia.org/wiki/%D0%9A%D0%BE%D1%8D%D1%84%D1%84%D0%B8%D1%86%D0%B8%D0%B5%D0%BD%D1%82_%D1%81%D1%85%D0%BE%D0%B4%D1%81%D1%82%D0%B2%D0%B0
  https://ru.wikipedia.org/wiki/%D0%9A%D0%BE%D1%8D%D1%84%D1%84%D0%B8%D1%86%D0%B8%D0%B5%D0%BD%D1%82_%D0%96%D0%B0%D0%BA%D0%BA%D0%B0%D1%80%D0%B0
 */
const _ = require('lodash');
const LZString = require('lz-string');
const hash = require('object-hash');
import {STORAGE_KEY, STORAGE_KEY_SIMILAR, StorageBoundExceededError} from './tables-utils';

export const tables = {};
const REPACK_RATIO = 0.8;

// According to performance estimates at http://pieroxy.net/blog/pages/lz-string/index.html
// 750k characters string is the threshold of input data beyond which lz-string is less efficient than lzma level-1
// So let's not exceed the threshold beyond which our underlying library is suboptimal.
// Besides that, compression (takes more time than decompression) is synchronous and for 600k it's going to be
// ~0.1-0.3 seconds (measured on Carbon X1 gen4 laptop) - better not take more time than that!
const UNCOMPRESSED_DATA_UPPER_BOUND = 600000;

class BoundedArray {
    constructor(data) {
        if (data) {
            this._decodeAndSetData(data);
        }
    }

    _decodeAndSetData(data) {
        let parsedData = [];
        try {
            const stringifiedData = LZString.decompressFromUTF16(data);
            parsedData = JSON.parse(stringifiedData);

            if (_.isArray(parsedData)) {
                this.data = parsedData;
            } else {
                console.error(`Got ${typeof parsedData}, while expecting an Array`);
            }
        } catch (error) {
            console.warn(error);
        }
    }

    dropOlderEntries() {
        const entriesAscendingByAtime = _.sortBy(this.data, (entry) => entry.atime);
        const elementsToKeep = Math.round(entriesAscendingByAtime.length * REPACK_RATIO);
        return _.takeRight(entriesAscendingByAtime, elementsToKeep);
    }

    serialize() {
        const stringified = JSON.stringify(this.data);
        if (stringified.length > UNCOMPRESSED_DATA_UPPER_BOUND) {
            throw new StorageBoundExceededError(
                `Source string is larger than ${UNCOMPRESSED_DATA_UPPER_BOUND}, delegating to repack`,
            );
        }
        return LZString.compressToUTF16(stringified);
    }

    push(entry) {
        this.data.push(Object.assign({}, entry, {atime: Date.now()}));
    }

    fetch(index) {
        const entry = this.data[index];
        entry.atime = Date.now();
        return entry;
    }
}

class BoundedMap extends BoundedArray {
    constructor(data) {
        super(data);
        this._init(this.data);
    }

    _init(data = []) {
        this.data = data;
        this.indices = {};
        _.each(data, ({key}, index) => {
            this.indices[key] = index;
        });
    }

    repackData() {
        this._init(this.dropOlderEntries());
    }

    add(key, value) {
        this.push({key, value});
        this.indices[key] = this.data.length - 1;
    }

    find(key) {
        if (Object.hasOwnProperty.call(this.indices, key)) {
            return this.fetch(this.indices[key]);
        } else {
            return null;
        }
    }
}

class InverseIndex extends BoundedArray {
    constructor(data) {
        super(data);
        this._init(this.data);
    }

    static TABLE_SIMILARITY_THRESHOLD = 0.9;

    static addToFrequences(container, word) {
        if (!container[word]) {
            container[word] = 0;
        }
        ++container[word];
    }

    _init(data = []) {
        this.factorsToFrequences = {};
        this.factorsToDataIndex = {};

        this.data = data; // (factors, value, atime)
        _.each(this.data, ({factors}, index) => {
            this._updateMappings(factors, index);
        });
    }

    _updateMappings(factors, dataIndex) {
        _.each(factors, (val) => {
            InverseIndex.addToFrequences(this.factorsToFrequences, val);
        });

        _.each(factors, (val) => {
            if (!this.factorsToDataIndex[val]) {
                this.factorsToDataIndex[val] = [];
            }
            this.factorsToDataIndex[val].push(dataIndex);
        });
    }

    repackData() {
        this._init(this.dropOlderEntries());
    }

    add(factors, value) {
        this.push({factors: factors, value: value});
        this._updateMappings(factors, this.data.length - 1);
    }

    find(factors) {
        const factorsToFrequences = this.factorsToFrequences;
        const data = this.data;
        const factorsToDataIndex = this.factorsToDataIndex;
        // const searchKeywords = _.map(searchName.replace(/"/g, '').split(/[ \.]/g),function (val) {return val.toLowerCase().trim();});
        let objectCandidates = [];

        _.each(factors, function (val) {
            if (Object.hasOwnProperty.call(factorsToDataIndex, val)) {
                objectCandidates = _.union(objectCandidates, factorsToDataIndex[val]);
            }
        });

        let maxValue = 0;
        let relevantIndex = -1;

        function getMeasure(factors) {
            let result = 0;
            _.each(factors, (val) => {
                if (factorsToFrequences[val]) {
                    result += 1 / factorsToFrequences[val];
                }
            });
            return result;
        }

        const factorsToFrequencesLocal = {};

        function getMeasureLocal(factors) {
            let result = 0;
            _.each(factors, (val) => {
                if (factorsToFrequencesLocal[val]) {
                    result += 1 / factorsToFrequencesLocal[val];
                }
            });
            return result;
        }

        _.each(objectCandidates, (index, objectIndex) => {
            const object = data[objectIndex];
            _.each(object.factors, (val) => {
                InverseIndex.addToFrequences(factorsToFrequencesLocal, val);
            });
        });

        _.each(factors, (val) => {
            InverseIndex.addToFrequences(factorsToFrequencesLocal, val);
        });

        _.each(objectCandidates, (objectIndex) => {
            const object = data[objectIndex];
            const intersectionOfFactors = _.filter(
                object.factors,
                (val) => factors.indexOf(val) !== -1,
            );

            const val = Math.max(
                getMeasure(intersectionOfFactors) /
                    (getMeasure(factors) +
                        getMeasure(object.factors) -
                        getMeasure(intersectionOfFactors)),
                getMeasureLocal(intersectionOfFactors) /
                    (getMeasureLocal(factors) +
                        getMeasureLocal(object.factors) -
                        getMeasureLocal(intersectionOfFactors)),
            );

            if (val > maxValue) {
                maxValue = val;
                relevantIndex = objectIndex;
            }
        });

        if (maxValue >= InverseIndex.TABLE_SIMILARITY_THRESHOLD) {
            return this.fetch(relevantIndex);
        } else {
            return null;
        }
    }
}

function restoreData() {
    if (window.localStorage) {
        return {
            similarColumnData: window.localStorage.getItem(STORAGE_KEY_SIMILAR),
            columnData: window.localStorage.getItem(STORAGE_KEY),
        };
    }
    return {};
}

function saveData(storageKey) {
    if (window.localStorage) {
        const columnSets = tables[storageKey];
        try {
            window.localStorage.setItem(storageKey, columnSets.serialize());
        } catch (error) {
            if (error instanceof StorageBoundExceededError) {
                columnSets.repackData();
                window.localStorage.setItem(storageKey, columnSets.serialize());
                console.warn(`Repacking due to '${storageKey}' limit exceeded`);
            } else {
                // global localStorage limit is exceeded, repack both stores
                const similarColumnSets = tables[STORAGE_KEY_SIMILAR];
                similarColumnSets.repackData();
                window.localStorage.setItem(STORAGE_KEY_SIMILAR, similarColumnSets.serialize());

                const columnSets = tables[STORAGE_KEY];
                columnSets.repackData();
                window.localStorage.setItem(STORAGE_KEY, columnSets.serialize());

                console.warn('Repacking due to global localStorage limit exceeded');
            }
        }
    }
}

function formatColumnName({name, keyColumn}) {
    return keyColumn ? `${name}:sorted` : name;
}

tables.initialize = function () {
    const {similarColumnData, columnData} = restoreData();
    this[STORAGE_KEY_SIMILAR] = new InverseIndex(similarColumnData);
    this[STORAGE_KEY] = new BoundedMap(columnData);
};

tables.loadSimilarKeys = function (columns) {
    const columnNames = _.map(columns, formatColumnName);
    const columnSet = this[STORAGE_KEY_SIMILAR].find(columnNames);
    //console.log('Loading columns', columnNames, columnsSet, this.similarColumnSets)
    if (columnSet === null) {
        return null;
    } else {
        // save columns so that fetched entry's access time is updated
        saveData(STORAGE_KEY_SIMILAR);
        return columnSet.value;
    }
};

tables.loadKeys = function (id, schema) {
    if (id) {
        const key = id + (schema ? `:${hash(schema)}` : '');
        const columnSet = this[STORAGE_KEY].find(key);
        if (columnSet === null) {
            return null;
        } else {
            // save columns so that fetched entry's access time is updated
            saveData(STORAGE_KEY);
            return columnSet.value;
        }
    } else {
        return null;
    }
};

tables.saveSimilarKeys = function (columns) {
    const columnNames = _.map(columns, formatColumnName);
    const columnSet = this[STORAGE_KEY_SIMILAR].find(columnNames);
    if (columnSet === null) {
        this[STORAGE_KEY_SIMILAR].add(columnNames, columns);
    } else {
        columnSet.value = columns;
    }
    //console.log('Saving columns', columnNames, this.similarColumnSets)
    saveData(STORAGE_KEY_SIMILAR);
};

tables.saveKeys = function (id, schema, columns) {
    if (id) {
        const key = id + (schema ? `:${hash(schema)}` : '');
        const columnSet = this[STORAGE_KEY].find(key);
        if (columnSet === null) {
            this[STORAGE_KEY].add(key, columns);
        } else {
            columnSet.value = columns;
        }
        saveData(STORAGE_KEY);
    }
};

tables.initialize();
