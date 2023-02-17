const format = require('./format');

function checkBytes(value, expected) {
    expect(format.Bytes(value)).toEqual(expected);
    expect(format.Bytes(String(value))).toEqual(expected);
}

describe('format', () => {
    describe('Bytes', () => {
        it('bytes', () => {
            checkBytes(1000, '1000 B');
            checkBytes(1000, '1000 B');
        });

        it('K-bytes', () => {
            checkBytes(2048, '2.00 KiB');
            checkBytes(1024 * 1000, '1000.00 KiB');
        });

        it('M-bytes', () => {
            checkBytes(1024 * 1024, '1.00 MiB');
            checkBytes(1024 * 1024 * 1023, '1023.00 MiB');
        });

        it('G-bytes', () => {
            checkBytes(1024 * 1024 * 1024, '1.00 GiB');
            checkBytes(1024 * 1024 * 1024 * 1023, '1023.00 GiB');
        });

        it('T-bytes', () => {
            checkBytes(1024 * 1024 * 1024 * 1024, '1.00 TiB');
            checkBytes(1024 * 1024 * 1024 * 1024 * 1023, '1023.00 TiB');
        });

        it('P-bytes', () => {
            checkBytes(1024 * 1024 * 1024 * 1024 * 1024, '1.00 PiB');
            checkBytes(1024 * 1024 * 1024 * 1024 * 1024 * 1023, '1023.00 PiB');
        });

        it('E-bytes', () => {
            checkBytes(1024 * 1024 * 1024 * 1024 * 1024 * 1024, '1.00 EiB');
            checkBytes(1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1023, '1023.00 EiB');
            checkBytes(1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1023, '1047552.00 EiB');
        });

        describe('Negative', () => {
            it('bytes', () => {
                checkBytes(-1000, '-1000 B');
            });

            it('K-bytes', () => {
                checkBytes(-2048, '-2.00 KiB');
                checkBytes(-1024 * 1000, '-1000.00 KiB');
            });

            it('M-bytes', () => {
                checkBytes(-1024 * 1024, '-1.00 MiB');
                checkBytes(-1024 * 1024 * 1023, '-1023.00 MiB');
            });
        });

        describe('NaN', () => {
            it('test', () => {
                expect(format.Bytes(null)).toBe(format.NO_VALUE);
                expect(format.Bytes(undefined)).toBe(format.NO_VALUE);
                expect(format.Bytes('abc')).toBe(format.NO_VALUE);
                expect(format.Bytes(NaN)).toBe(format.NO_VALUE);
                expect(format.Bytes('')).toBe(format.NO_VALUE);
            });
        });
    });

    describe('Number', () => {
        describe('NaN', () => {
            it('test', () => {
                expect(format.Number(null)).toBe(format.NO_VALUE);
                expect(format.Number(undefined)).toBe(format.NO_VALUE);
                expect(format.Number('abc')).toBe(format.NO_VALUE);
                expect(format.Number(NaN)).toBe(format.NO_VALUE);
                expect(format.Number('')).toBe(format.NO_VALUE);
            });
        });
        describe('valid number', () => {
            it('defaults', () => {
                expect(format.Number(1234567.8901234)).toBe('1 234 568');
                expect(format.Number(123456789.01234)).toBe('123 456 789');
            });
            it('digits', () => {
                expect(format.Number(123.456, {digits: 1})).toBe('123.5');
                expect(format.Number(123.456, {digits: 2})).toBe('123.46');
                expect(format.Number(123.456, {digits: 3})).toBe('123.456');
                expect(format.Number(123.456, {digits: 4})).toBe('123.4560');
                expect(format.Number(123.456, {digits: 5})).toBe('123.45600');
                expect(format.Number(0.6 / 3, {digits: 5})).toBe('0.20000');
            });
            it('groups', () => {
                expect(format.Number(1234567.890123456, {digits: 9})).toBe('1 234 567.890123456');
            });
        });
        describe('valid string', () => {
            it('defaults', () => {
                expect(format.Number('1234567.8901234')).toBe('1 234 568');
                expect(format.Number('123456789.01234')).toBe('123 456 789');
            });
            it('digits', () => {
                expect(format.Number('123.456', {digits: 1})).toBe('123.5');
                expect(format.Number('123.456', {digits: 2})).toBe('123.46');
                expect(format.Number('123.456', {digits: 3})).toBe('123.456');
                expect(format.Number('123.456', {digits: 4})).toBe('123.4560');
                expect(format.Number('123.456', {digits: 5})).toBe('123.45600');
                expect(format.Number('' + 0.6 / 3, {digits: 5})).toBe('0.20000');
            });
            it('groups', () => {
                expect(format.Number('1234567.890123456', {digits: 9})).toBe('1 234 567.890123456');
            });
        });
    });
});
