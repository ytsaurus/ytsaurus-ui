const {utils} = require('./utils');

describe('hammer.utils', () => {
    it('isObject', () => {
        expect(utils).toEqual(
            expect.objectContaining({
                extractFirstByte: expect.any(Function),
            }),
        );
    });

    describe('API', () => {
        it('extractFirstByte()', () => {
            const inputIds = [
                '49a358d5-c1df8b53-3fc03e8-df91de8b',
                'd661ff8d-8dd802e3-3fc03e8-fc3dd80a',
                '34021e11-d73096e6-3fc03e8-e3eb6c00',
            ];
            const expectedBytes = ['8b', '0a', '00'];
            const actualBytes = inputIds.map(utils.extractFirstByte);

            expect(expectedBytes).toEqual(actualBytes);
        });
    });
});
