import {
    customEncodeURIComponent,
    parseSortStateArray,
    serializeSortStateArray,
} from './url-mapping';

describe('utils/utils.tsx', () => {
    describe('customEncodeURIComponent', () => {
        it('Escape %', () => {
            expect(customEncodeURIComponent('%')).toEqual('%25');
        });
        it('Escape #', () => {
            expect(customEncodeURIComponent('#')).toEqual('%23');
        });
        it('Escape \n', () => {
            expect(customEncodeURIComponent('\n')).toEqual('%0A');
        });
        it('Escape +', () => {
            expect(customEncodeURIComponent('+')).toEqual('%2B');
        });
        it('Escape [', () => {
            expect(customEncodeURIComponent('[')).toEqual('%5B');
        });
        it('Escape ]', () => {
            expect(customEncodeURIComponent(']')).toEqual('%5D');
        });
        it('Escape =', () => {
            expect(customEncodeURIComponent('=')).toEqual('%3D');
        });
        it('Escape &', () => {
            expect(customEncodeURIComponent('&')).toEqual('%26');
        });
    });

    describe('parseSortStateArray', () => {
        it('col-name:asc', () => {
            expect(parseSortStateArray('col%2dname-asc')).toEqual([
                {column: 'col-name', order: 'asc'},
            ]);
        });

        it('col-name:desc', () => {
            expect(parseSortStateArray('col%2dname-desc')).toEqual([
                {column: 'col-name', order: 'desc'},
            ]);
        });

        it('col-name:asc-undefined', () => {
            expect(parseSortStateArray('col%2dname-asc%2dundefined')).toEqual([
                {column: 'col-name', order: 'asc-undefined'},
            ]);
        });

        it('col-name:desc-undefined', () => {
            expect(parseSortStateArray('col%2dname-desc%2dundefined')).toEqual([
                {column: 'col-name', order: 'desc-undefined'},
            ]);
        });

        it('col-name:undefined-asc', () => {
            expect(parseSortStateArray('col%2dname-undefined%2dasc')).toEqual([
                {column: 'col-name', order: 'undefined-asc'},
            ]);
        });

        it('col-name:undefined-desc', () => {
            expect(parseSortStateArray('col%2dname-undefined%2ddesc')).toEqual([
                {column: 'col-name', order: 'undefined-desc'},
            ]);
        });

        it('col-name1:undefined-desc,col-name2:desc-undefined', () => {
            expect(
                parseSortStateArray('col%2dname1-undefined%2ddesc,col%2dname2-asc%2dundefined'),
            ).toEqual([
                {column: 'col-name1', order: 'undefined-desc'},
                {column: 'col-name2', order: 'asc-undefined'},
            ]);
        });

        it(':asc,col-name:', () => {
            expect(parseSortStateArray('-asc,col%2Dname-')).toEqual([]);
        });
    });

    describe('serializeSortStateArray', () => {
        it('col-name:asc', () => {
            expect(serializeSortStateArray([{column: 'col-name', order: 'asc'}])).toEqual(
                'col%2Dname-asc',
            );
        });

        it('col-name:desc', () => {
            expect(serializeSortStateArray([{column: 'col-name', order: 'desc'}])).toEqual(
                'col%2Dname-desc',
            );
        });

        it('col-name:asc-undefined', () => {
            expect(serializeSortStateArray([{column: 'col-name', order: 'asc-undefined'}])).toEqual(
                'col%2Dname-asc%2Dundefined',
            );
        });

        it('col-name:desc-undefined', () => {
            expect(
                serializeSortStateArray([{column: 'col-name', order: 'desc-undefined'}]),
            ).toEqual('col%2Dname-desc%2Dundefined');
        });

        it('col-name:undefined-asc', () => {
            expect(serializeSortStateArray([{column: 'col-name', order: 'undefined-asc'}])).toEqual(
                'col%2Dname-undefined%2Dasc',
            );
        });

        it('col-name:undefined-desc', () => {
            expect(
                serializeSortStateArray([{column: 'col-name', order: 'undefined-desc'}]),
            ).toEqual('col%2Dname-undefined%2Ddesc');
        });

        it('col-name1:undefined-desc,col-name2:desc-undefined', () => {
            expect(
                serializeSortStateArray([
                    {column: 'col-name1', order: 'undefined-desc'},
                    {column: 'col-name2', order: 'asc-undefined'},
                ]),
            ).toEqual('col%2Dname1-undefined%2Ddesc,col%2Dname2-asc%2Dundefined');
        });

        it(':asc,col-name:', () => {
            expect(serializeSortStateArray([{order: 'asc'}, {column: 'col-name'}])).toEqual('');
        });
    });
});
