const format = require('./format');

describe('format', () => {
    describe('NumberWithSuffix', () => {
        function checkNumberWithSuffix(value, expected) {
            expect(format.NumberWithSuffix(value)).toEqual(expected);
            expect(format.NumberWithSuffix(String(value))).toEqual(expected);
        }

        it('<1000', () => {
            checkNumberWithSuffix(999, '999');
        });

        it('K', () => {
            checkNumberWithSuffix(2000, '2.00 K');
            checkNumberWithSuffix(1000 * 999, '999.00 K');
        });

        it('M', () => {
            checkNumberWithSuffix(1000 * 1000, '1.00 M');
            checkNumberWithSuffix(1000 * 1000 * 999, '999.00 M');
        });

        it('G', () => {
            checkNumberWithSuffix(1000 * 1000 * 1000, '1.00 G');
            checkNumberWithSuffix(1000 * 1000 * 1000 * 999, '999.00 G');
        });

        it('T', () => {
            checkNumberWithSuffix(1000 * 1000 * 1000 * 1000, '1.00 T');
            checkNumberWithSuffix(1000 * 1000 * 1000 * 1000 * 999, '999.00 T');
        });

        it('P', () => {
            checkNumberWithSuffix(1000 * 1000 * 1000 * 1000 * 1000, '1.00 P');
            checkNumberWithSuffix(1000 * 1000 * 1000 * 1000 * 1000 * 999, '999.00 P');
        });

        it('E', () => {
            checkNumberWithSuffix(1000 * 1000 * 1000 * 1000 * 1000 * 1000, '1.00 E');
            checkNumberWithSuffix(1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 999, '999.00 E');
            checkNumberWithSuffix(
                1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 999,
                '999000.00 E',
            );
        });

        describe('Negative', () => {
            it('-999', () => {
                checkNumberWithSuffix(-999, '-999');
            });

            it('-K ', () => {
                checkNumberWithSuffix(-2000, '-2.00 K');
                checkNumberWithSuffix(-1000 * 999, '-999.00 K');
            });

            it('-M ', () => {
                checkNumberWithSuffix(-1000 * 1000, '-1.00 M');
                checkNumberWithSuffix(-1000 * 1000 * 999, '-999.00 M');
            });
        });

        describe('NaN', () => {
            it('test', () => {
                expect(format.NumberWithSuffix(null)).toBe(format.NO_VALUE);
                expect(format.NumberWithSuffix(undefined)).toBe(format.NO_VALUE);
                expect(format.NumberWithSuffix('abc')).toBe(format.NO_VALUE);
                expect(format.NumberWithSuffix(NaN)).toBe(format.NO_VALUE);
                expect(format.NumberWithSuffix('')).toBe(format.NO_VALUE);
            });
        });
    });

    describe('Bytes', () => {
        function checkBytes(value, expected) {
            expect(format.Bytes(value)).toEqual(expected);
            expect(format.Bytes(String(value))).toEqual(expected);
        }

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
                expect(format.Number(String(0.6 / 3), {digits: 5})).toBe('0.20000');
            });
            it('groups', () => {
                expect(format.Number('1234567.890123456', {digits: 9})).toBe('1 234 567.890123456');
            });
        });
    });

    describe('Hex', () => {
        expect(format.Hex(0x1000)).toBe('1000');
        expect(format.Hex(0x0abc)).toBe('abc');
        expect(format.Hex('0x0abc')).toBe('abc');
        expect(format.Hex('0xabc')).toBe('abc');
        expect(format.Hex(0)).toBe('0');
        expect(format.Hex(0n)).toBe('0');
        expect(format.Hex()).toBe(format.NO_VALUE);
        expect(format.Hex(NaN)).toBe(format.NO_VALUE);
        expect(format.Hex(null)).toBe(format.NO_VALUE);
        expect(format.Hex('')).toBe(format.NO_VALUE);
        expect(format.Hex('0abc')).toBe(format.NO_VALUE);
        expect(format.Hex('abc')).toBe(format.NO_VALUE);
    });
});
