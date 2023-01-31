const _ = require('lodash');
const LZString = require('lz-string');
import {tables} from './tables';
import {STORAGE_KEY, STORAGE_KEY_SIMILAR, StorageBoundExceededError} from './tables-utils';

const columnSet = [
    {
        name: 'canonized_vhost',
        keyColumn: true,
        checked: true,
    },
    {
        name: 'raw_yandexuid',
        keyColumn: true,
        checked: true,
    },
    {
        name: 'stbx_ip',
        keyColumn: true,
        checked: true,
    },
    {
        name: 'iso_eventtime',
        keyColumn: true,
    },
    {
        name: 'method',
        checked: true,
    },
    {
        name: 'protocol',
    },
    {
        name: 'referer',
        checked: true,
    },
    {
        name: 'request',
    },
];

const additionalColumns = [
    {
        name: 'The Jinmoti of Bozlen Two',
    },
    {
        name: 'kill the hereditary ritual assassins',
    },
    {
        name: "of the new Yearking's immediate family",
    },
    {
        name: 'by drowning them',
    },
    {
        name: 'in the tears of the Continental Empathaur',
    },
    {
        name: 'in its Sadness Season',
    },
];

const evenMoreColumns = [
    {
        name: 'not so important',
    },
    {
        name: 'a bit more',
    },
    {
        name: 'just a tiny bit to provide bytes',
    },
];

describe('hammer.tables', () => {
    beforeEach(() => {
        tables.initialize();
    });

    describe('in absence of localStorage', () => {
        describe('similar columns', () => {
            it('initially no column sets are saved', () => {
                const loadedColumns = tables.loadSimilarKeys(columnSet);
                expect(loadedColumns).toBe(null);
            });

            describe('', () => {
                beforeEach(() => {
                    tables.saveSimilarKeys(columnSet);
                });

                it('restored columns are exactly the ones that have been saved', () => {
                    const loadedColumns = tables.loadSimilarKeys(columnSet);
                    expect(loadedColumns).toEqual(columnSet);
                });

                it('slightly different keys still match the original column set', () => {
                    const slightlyMoreColumns = [...columnSet, {name: 'just_another_name'}];
                    const loadedColumns = tables.loadSimilarKeys(slightlyMoreColumns);

                    expect(loadedColumns).toEqual(columnSet);
                });

                it('significantly different keys do not match the original column set', () => {
                    const slightlyLessColumns = _.drop(columnSet, 2);
                    const loadedColumns = tables.loadSimilarKeys(slightlyLessColumns);

                    expect(loadedColumns).not.toEqual(columnSet);
                });

                it('yet original keys + a lot of new keys still matches original column set', () => {
                    const significantlyMoreColumns = [...columnSet, ...additionalColumns];
                    const loadedColumns = tables.loadSimilarKeys(significantlyMoreColumns);

                    expect(loadedColumns).toEqual(columnSet);
                });
            });
        });

        describe('direct columns', () => {
            const tableId = 'a_direct_table_id';

            const tableSchema = [
                {
                    name: 'canonized_vhost',
                    required: false,
                    sort_order: 'ascending',
                    type: 'any',
                },
                {
                    name: 'raw_yandexuid',
                    required: false,
                    sort_order: 'ascending',
                    type: 'any',
                },
                {
                    name: 'stbx_ip',
                    required: false,
                    sort_order: 'ascending',
                    type: 'any',
                },
                {
                    name: 'iso_eventtime',
                    required: false,
                    sort_order: 'ascending',
                    type: 'any',
                },
            ];

            it('initially no column sets are saved', () => {
                const loadedColumns = tables.loadKeys(tableId, tableSchema);
                expect(loadedColumns).toBe(null);
            });

            describe('with tableSchema', () => {
                beforeEach(() => {
                    tables.saveKeys(tableId, tableSchema, columnSet);
                });

                it('restored columns are exactly the ones that have been saved', () => {
                    const loadedColumns = tables.loadKeys(tableId, tableSchema);
                    expect(loadedColumns).toEqual(columnSet);
                });

                it('slightest alteration of table id will result in no data being returned', () => {
                    const loadedColumns = tables.loadKeys(tableId + '1', tableSchema);

                    expect(loadedColumns).toBe(null);
                });

                it('slightest alteration of table schema will result in no data being returned', () => {
                    const alteredSchema = tableSchema.concat({
                        name: 'one_more_field',
                        required: false,
                        sort_order: 'ascending',
                        type: 'any',
                    });
                    const loadedColumns = tables.loadKeys(tableId, alteredSchema);

                    expect(loadedColumns).toBe(null);
                });
            });

            describe('without tableSchema', () => {
                beforeEach(() => {
                    tables.saveKeys(tableId, undefined, columnSet);
                });

                it('restored columns are exactly the ones that have been saved', () => {
                    const loadedColumns = tables.loadKeys(tableId);
                    expect(loadedColumns).toEqual(columnSet);
                });

                it('slightest alteration of table id will result in no data being returned', () => {
                    const loadedColumns = tables.loadKeys(tableId + '1');

                    expect(loadedColumns).toBe(null);
                });

                it('adding schema to previously schemaless table will result in no data being returned', () => {
                    const loadedColumns = tables.loadKeys(tableId, tableSchema);

                    expect(loadedColumns).toBe(null);
                });
            });
        });
    });

    describe('in presence of localStorage', () => {
        const emptyData = {
            data: [],
            factorsToDataIndex: {},
            factorsToFrequences: {},
        };

        let storage = {};
        beforeEach(() => {
            window.localStorage = {
                getItem: (key) => storage[key],
                setItem: (key, value) => {
                    storage[key] = value;
                },
            };
        });

        const warnMock = jest.fn();
        global.console.warn = warnMock;

        afterEach(() => {
            storage = {};
            warnMock.mockReset();
        });

        describe('similar columns', () => {
            it('no data in localStorage means empty column sets', () => {
                tables.initialize();
                const loadedColumns = tables.loadSimilarKeys(columnSet);

                expect(loadedColumns).toBe(null);
            });

            it('stringified json in localStorage treated as empty columns sets, since compressed data is expected', () => {
                storage[STORAGE_KEY_SIMILAR] = JSON.stringify('{data: "some"}');
                tables.initialize();
                const loadedColumns = tables.loadSimilarKeys(columnSet);
                const similarColumnSets = tables[STORAGE_KEY_SIMILAR];

                expect(warnMock.mock.calls.length).toBe(1);
                expect(similarColumnSets).toEqual(emptyData);
                expect(loadedColumns).toBe(null);
            });

            it('saveSimilarKeys() puts compressed data into localStorage', () => {
                tables.initialize();
                tables.saveSimilarKeys(columnSet);

                expect(storage[STORAGE_KEY_SIMILAR].length).toBeGreaterThan(0);
                expect(() => JSON.parse(storage[STORAGE_KEY_SIMILAR])).toThrow(/Unexpected token/);
            });

            it('compressed data put into localStorage is properly restored and issues no warnings', () => {
                tables.initialize();
                tables.saveSimilarKeys(columnSet);
                // initialize second time to deserialize compressed string
                tables.initialize();
                const loadedColumns = tables.loadSimilarKeys(columnSet);
                const similarColumnSets = tables[STORAGE_KEY_SIMILAR];

                expect(similarColumnSets.data.length).toBe(1);
                expect(Object.keys(similarColumnSets.factorsToFrequences).length).toBe(8);
                expect(Object.keys(similarColumnSets.factorsToDataIndex).length).toBe(8);
                expect(warnMock.mock.calls.length).toBe(0);
                expect(loadedColumns).toEqual(columnSet);
            });
        });

        describe('when localStorage quota is exceeded', () => {
            function countElements(rawString) {
                const stringifiedData = LZString.decompressFromUTF16(rawString);
                const parsedData = JSON.parse(stringifiedData);
                return parsedData.length;
            }

            describe('similar columns', () => {
                beforeEach(() => {
                    window.localStorage.setItem = (key, value) => {
                        if (key === STORAGE_KEY_SIMILAR && countElements(value) > 2) {
                            throw new StorageBoundExceededError('Storage quota exceeded');
                        }
                        storage[key] = value;
                    };
                });

                it('repackData should drop one of saved similar column sets', () => {
                    tables.initialize();
                    tables.saveSimilarKeys(columnSet);
                    tables.saveSimilarKeys(additionalColumns);
                    const similarColumnSets = tables[STORAGE_KEY_SIMILAR];

                    expect(similarColumnSets.data.length).toBe(2);

                    tables.saveSimilarKeys(evenMoreColumns);

                    expect(warnMock.mock.calls.length).toBe(1);
                    expect(similarColumnSets.data.length).toBe(2);

                    tables.initialize();

                    expect(similarColumnSets.data.length).toBe(2);
                });

                it('repackData should drop the oldest saved similar column set', () => {
                    tables.initialize();
                    tables.saveSimilarKeys(columnSet);
                    tables.saveSimilarKeys(additionalColumns);
                    tables.saveSimilarKeys(evenMoreColumns);

                    const oldestColumns = tables.loadSimilarKeys(columnSet);
                    const newerColumns = tables.loadSimilarKeys(additionalColumns);
                    const newestColumns = tables.loadSimilarKeys(evenMoreColumns);

                    expect(oldestColumns).toBe(null);
                    expect(newerColumns).toEqual(additionalColumns);
                    expect(newestColumns).toEqual(evenMoreColumns);
                });

                it('repackData should drop the oldest (now the other one) saved similar column set', () => {
                    tables.initialize();
                    tables.saveSimilarKeys(additionalColumns);
                    tables.saveSimilarKeys(columnSet);
                    tables.saveSimilarKeys(evenMoreColumns);

                    const oldestColumns = tables.loadSimilarKeys(additionalColumns);
                    const newerColumns = tables.loadSimilarKeys(columnSet);
                    const newestColumns = tables.loadSimilarKeys(evenMoreColumns);

                    expect(oldestColumns).toBe(null);
                    expect(newerColumns).toBe(columnSet);
                    expect(newestColumns).toEqual(evenMoreColumns);
                });

                it('repackData should not drop anything from direct columns storage', () => {
                    tables.initialize();

                    tables.saveKeys('id1', undefined, columnSet);
                    tables.saveKeys('id2', undefined, additionalColumns);
                    tables.saveKeys('id3', undefined, evenMoreColumns);

                    tables.saveSimilarKeys(columnSet);
                    tables.saveSimilarKeys(additionalColumns);
                    tables.saveSimilarKeys(evenMoreColumns);

                    const oldestColumns = tables.loadKeys('id1');
                    const newerColumns = tables.loadKeys('id2');
                    const newestColumns = tables.loadKeys('id3');

                    expect(oldestColumns).toBe(columnSet);
                    expect(newerColumns).toBe(additionalColumns);
                    expect(newestColumns).toBe(evenMoreColumns);
                });
            });

            describe('direct columns', () => {
                beforeEach(() => {
                    window.localStorage.setItem = (key, value) => {
                        if (key === STORAGE_KEY && countElements(value) > 2) {
                            throw new StorageBoundExceededError('Storage quota exceeded');
                        }
                        storage[key] = value;
                    };
                });

                it('repackData should drop one of saved direct column sets', () => {
                    tables.initialize();
                    tables.saveKeys('id1', undefined, columnSet);
                    tables.saveKeys('id2', undefined, additionalColumns);
                    const columnSets = tables[STORAGE_KEY];

                    expect(columnSets.data.length).toBe(2);

                    tables.saveKeys('id3', undefined, evenMoreColumns);

                    expect(warnMock.mock.calls.length).toBe(1);
                    expect(columnSets.data.length).toBe(2);

                    tables.initialize();

                    expect(columnSets.data.length).toBe(2);
                });

                it('repackData should drop the oldest saved direct column set', () => {
                    tables.initialize();
                    tables.saveKeys('id1', undefined, columnSet);
                    tables.saveKeys('id2', undefined, additionalColumns);
                    tables.saveKeys('id3', undefined, evenMoreColumns);

                    const oldestColumns = tables.loadKeys('id1');
                    const newerColumns = tables.loadKeys('id2');
                    const newestColumns = tables.loadKeys('id3');

                    expect(oldestColumns).toBe(null);
                    expect(newerColumns).toEqual(additionalColumns);
                    expect(newestColumns).toEqual(evenMoreColumns);
                });

                it('repackData should drop the oldest (now the other one) saved direct column set', () => {
                    tables.initialize();
                    tables.saveKeys('id1', undefined, additionalColumns);
                    tables.saveKeys('id2', undefined, columnSet);
                    tables.saveKeys('id3', undefined, evenMoreColumns);

                    const oldestColumns = tables.loadKeys('id1');
                    const newerColumns = tables.loadKeys('id2');
                    const newestColumns = tables.loadKeys('id3');

                    expect(oldestColumns).toBe(null);
                    expect(newerColumns).toBe(columnSet);
                    expect(newestColumns).toEqual(evenMoreColumns);
                });

                it('repackData should not drop anything from similar columns storage', () => {
                    tables.initialize();

                    tables.saveSimilarKeys(columnSet);
                    tables.saveSimilarKeys(additionalColumns);
                    tables.saveSimilarKeys(evenMoreColumns);

                    tables.saveKeys('id1', undefined, columnSet);
                    tables.saveKeys('id2', undefined, additionalColumns);
                    tables.saveKeys('id3', undefined, evenMoreColumns);

                    const oldestColumns = tables.loadSimilarKeys(columnSet);
                    const newerColumns = tables.loadSimilarKeys(additionalColumns);
                    const newestColumns = tables.loadSimilarKeys(evenMoreColumns);

                    expect(oldestColumns).toBe(columnSet);
                    expect(newerColumns).toBe(additionalColumns);
                    expect(newestColumns).toBe(evenMoreColumns);
                });
            });

            it('and it is global quota, call repackData from both stores', () => {
                window.localStorage.setItem = (key, value) => {
                    const storage1 = storage[STORAGE_KEY_SIMILAR];
                    const storage2 = storage[STORAGE_KEY];
                    const LIMIT = 5;

                    if (storage1 && storage2) {
                        if (
                            (key === STORAGE_KEY &&
                                countElements(storage1) + countElements(value) > LIMIT) ||
                            (key === STORAGE_KEY_SIMILAR &&
                                countElements(storage2) + countElements(value) > LIMIT)
                        ) {
                            throw new Error('Global storage quota exceeded');
                        }
                    }
                    storage[key] = value;
                };

                tables.initialize();

                tables.saveSimilarKeys(columnSet);
                tables.saveSimilarKeys(additionalColumns);
                tables.saveSimilarKeys(evenMoreColumns);

                tables.saveKeys('id1', undefined, columnSet);
                tables.saveKeys('id2', undefined, additionalColumns);
                tables.saveKeys('id3', undefined, evenMoreColumns);

                const oldestColumnsSimilar = tables.loadSimilarKeys(columnSet);
                const newerColumnsSimilar = tables.loadSimilarKeys(additionalColumns);
                const newestColumnsSimilar = tables.loadSimilarKeys(evenMoreColumns);
                const oldestColumnsDirect = tables.loadKeys('id1');
                const newerColumnsDirect = tables.loadKeys('id2');
                const newestColumnsDirect = tables.loadKeys('id3');

                expect(oldestColumnsSimilar).toBe(null);
                expect(newerColumnsSimilar).toBe(additionalColumns);
                expect(newestColumnsSimilar).toBe(evenMoreColumns);
                expect(oldestColumnsDirect).toBe(null);
                expect(newerColumnsDirect).toBe(additionalColumns);
                expect(newestColumnsDirect).toBe(evenMoreColumns);
            });
        });
    });
});
