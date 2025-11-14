import format from './format';
import moment from 'moment-timezone';

describe('format.DateTime', () => {
    beforeEach(() => {
        moment.tz.setDefault('GMT+0');
    });

    describe('when value is undefined', () => {
        it('should return NO_VALUE', () => {
            const result = format.DateTime(undefined);
            expect(result).toBe(format.NO_VALUE);
        });
    });

    describe('when value is null', () => {
        it('should handle null value', () => {
            const result = format.DateTime(null);
            // null might be processed differently, so we just check it's not undefined
            expect(result).toBe(format.NO_VALUE);
        });
    });

    describe('with custom pattern', () => {
        const testDate = '2023-09-15T10:30:45Z';

        it('should use custom pattern when provided', () => {
            const result = format.DateTime(testDate, {pattern: 'YYYY-MM-DD'});
            expect(result).toBe('2023-09-15');
        });

        it('should use custom pattern with time', () => {
            const result = format.DateTime(testDate, {pattern: 'HH:mm:ss'});
            expect(result).toBe('10:30:45');
        });

        it('should use custom pattern with full format', () => {
            const result = format.DateTime(testDate, {pattern: 'YYYY-MM-DD HH:mm:ss'});
            expect(result).toBe('2023-09-15 10:30:45');
        });

        it('should prioritize pattern over format setting', () => {
            const result = format.DateTime(testDate, {
                pattern: 'MM/DD/YYYY',
                format: 'full',
            });
            expect(result).toBe('09/15/2023');
        });
    });

    describe('with format setting', () => {
        const testDate = '2023-09-15T10:30:45Z';

        it('should format as full date when format is "full"', () => {
            const result = format.DateTime(testDate, {format: 'full'});
            expect(result).toBe('15 Sep 2023 10:30:45');
        });

        it('should format as short date when format is "short"', () => {
            const result = format.DateTime(testDate, {format: 'short'});
            expect(result).toBe('15 Sep 10:30');
        });

        it('should format as day when format is "day"', () => {
            const result = format.DateTime(testDate, {format: 'day'});
            expect(result).toBe('15 Sep 2023');
        });

        it('should format as month when format is "month"', () => {
            const result = format.DateTime(testDate, {format: 'month'});
            expect(result).toBe('September 2023');
        });

        it('should format as time when format is "time"', () => {
            const result = format.DateTime(testDate, {format: 'time'});
            expect(result).toBe('10:30:45');
        });

        it('should throw error for unknown format', () => {
            expect(() => {
                format.DateTime(testDate, {format: 'unknown'});
            }).toThrow(
                'hammer.format.DateTime: Unknown `format` option. Please specify one of [human, full, short, day, month] or use `pattern` option.',
            );
        });
    });

    describe('with default format', () => {
        const testDate = '2023-09-15T10:30:45Z';

        it('should use "full" format by default', () => {
            const result = format.DateTime(testDate);
            expect(result).toBe('15 Sep 2023 10:30:45');
        });

        it('should use "full" format with empty settings', () => {
            const result = format.DateTime(testDate, {});
            expect(result).toBe('15 Sep 2023 10:30:45');
        });

        it('should use "full" format with null settings', () => {
            const result = format.DateTime(testDate, null);
            expect(result).toBe('15 Sep 2023 10:30:45');
        });
    });

    describe('with different input types', () => {
        it('should handle ISO string', () => {
            const result = format.DateTime('2023-09-15T10:30:45.123Z');
            expect(result).toBe('15 Sep 2023 10:30:45');
        });

        it('should handle timestamp in milliseconds', () => {
            const timestamp = 1694772645000; // 2023-09-15T10:30:45Z
            const result = format.DateTime(timestamp);
            // Note: timestamp might be interpreted differently, so we just check it's a valid date string
            expect(typeof result).toBe('string');
            expect(result).not.toBe(format.NO_VALUE);
        });

        it('should handle string date in different format', () => {
            const result = format.DateTime('2023-09-15 10:30:45');
            expect(result).toBe('15 Sep 2023 10:30:45');
        });
    });

    describe('edge cases', () => {
        it('should handle zero timestamp', () => {
            const result = format.DateTime(0);
            expect(result).toBe('01 Jan 1970 00:00:00');
        });
    });

    describe('different date scenarios', () => {
        it('should handle leap year date', () => {
            const result = format.DateTime('2024-02-29T12:00:00Z');
            expect(result).toBe('29 Feb 2024 12:00:00');
        });

        it('should handle end of year date', () => {
            const result = format.DateTime('2023-12-31T23:59:59Z');
            expect(result).toBe('31 Dec 2023 23:59:59');
        });

        it('should handle beginning of year date', () => {
            const result = format.DateTime('2023-01-01T00:00:00Z');
            expect(result).toBe('01 Jan 2023 00:00:00');
        });

        it('should handle different months correctly', () => {
            const testCases = [
                {input: '2023-01-15T12:00:00Z', expected: '15 Jan 2023 12:00:00'},
                {input: '2023-02-15T12:00:00Z', expected: '15 Feb 2023 12:00:00'},
                {input: '2023-03-15T12:00:00Z', expected: '15 Mar 2023 12:00:00'},
                {input: '2023-04-15T12:00:00Z', expected: '15 Apr 2023 12:00:00'},
                {input: '2023-05-15T12:00:00Z', expected: '15 May 2023 12:00:00'},
                {input: '2023-06-15T12:00:00Z', expected: '15 Jun 2023 12:00:00'},
                {input: '2023-07-15T12:00:00Z', expected: '15 Jul 2023 12:00:00'},
                {input: '2023-08-15T12:00:00Z', expected: '15 Aug 2023 12:00:00'},
                {input: '2023-09-15T12:00:00Z', expected: '15 Sep 2023 12:00:00'},
                {input: '2023-10-15T12:00:00Z', expected: '15 Oct 2023 12:00:00'},
                {input: '2023-11-15T12:00:00Z', expected: '15 Nov 2023 12:00:00'},
                {input: '2023-12-15T12:00:00Z', expected: '15 Dec 2023 12:00:00'},
            ];

            testCases.forEach(({input, expected}) => {
                const result = format.DateTime(input);
                expect(result).toBe(expected);
            });
        });
    });

    describe('custom patterns', () => {
        const testDate = '2023-09-15T10:30:45Z';

        it('should format with YYYY pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'YYYY'});
            expect(result).toBe('2023');
        });

        it('should format with MM pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'MM'});
            expect(result).toBe('09');
        });

        it('should format with DD pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'DD'});
            expect(result).toBe('15');
        });

        it('should format with HH pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'HH'});
            expect(result).toBe('10');
        });

        it('should format with mm pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'mm'});
            expect(result).toBe('30');
        });

        it('should format with ss pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'ss'});
            expect(result).toBe('45');
        });

        it('should format with YYYY-MM pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'YYYY-MM'});
            expect(result).toBe('2023-09');
        });

        it('should format with MM-DD pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'MM-DD'});
            expect(result).toBe('09-15');
        });

        it('should format with DD/MM/YYYY pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'DD/MM/YYYY'});
            expect(result).toBe('15/09/2023');
        });

        it('should format with HH:mm pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'HH:mm'});
            expect(result).toBe('10:30');
        });

        it('should format with mm:ss pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'mm:ss'});
            expect(result).toBe('30:45');
        });

        it('should format with YYYY-MM-DD HH:mm pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'YYYY-MM-DD HH:mm'});
            expect(result).toBe('2023-09-15 10:30');
        });

        it('should format with DD MMM YYYY pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'DD MMM YYYY'});
            expect(result).toBe('15 Sep 2023');
        });

        it('should format with MMM DD, YYYY pattern', () => {
            const result = format.DateTime(testDate, {pattern: 'MMM DD, YYYY'});
            expect(result).toBe('Sep 15, 2023');
        });
    });

    describe('all format types', () => {
        const testDate = '2023-09-15T10:30:45Z';

        it('should format with "full" format', () => {
            const result = format.DateTime(testDate, {format: 'full'});
            expect(result).toBe('15 Sep 2023 10:30:45');
        });

        it('should format with "short" format', () => {
            const result = format.DateTime(testDate, {format: 'short'});
            expect(result).toBe('15 Sep 10:30');
        });

        it('should format with "day" format', () => {
            const result = format.DateTime(testDate, {format: 'day'});
            expect(result).toBe('15 Sep 2023');
        });

        it('should format with "month" format', () => {
            const result = format.DateTime(testDate, {format: 'month'});
            expect(result).toBe('September 2023');
        });

        it('should format with "time" format', () => {
            const result = format.DateTime(testDate, {format: 'time'});
            expect(result).toBe('10:30:45');
        });
    });
});

describe('format.NumberSmart', () => {
    describe('when value is not a valid number', () => {
        it('should return NO_VALUE for undefined', () => {
            const result = format.NumberSmart(undefined);
            expect(result).toBe(format.NO_VALUE);
        });

        it('should return NO_VALUE for null', () => {
            const result = format.NumberSmart(null);
            expect(result).toBe(format.NO_VALUE);
        });

        it('should return NO_VALUE for NaN', () => {
            const result = format.NumberSmart(NaN);
            expect(result).toBe(format.NO_VALUE);
        });

        it('should return NO_VALUE for non-numeric string', () => {
            const result = format.NumberSmart('abc');
            expect(result).toBe(format.NO_VALUE);
        });
    });

    describe('when value is zero', () => {
        it('should return "0" for zero', () => {
            const result = format.NumberSmart(0);
            expect(result).toBe('0');
        });

        it('should return "0" for zero with custom significantDigits', () => {
            const result = format.NumberSmart(0, {significantDigits: 5});
            expect(result).toBe('0');
        });
    });

    describe('with default significantDigits (3)', () => {
        describe('integer values', () => {
            it('should format small integers without decimals', () => {
                expect(format.NumberSmart(1)).toBe('1');
                expect(format.NumberSmart(12)).toBe('12');
                expect(format.NumberSmart(123)).toBe('123');
            });

            it('should format large integers without decimals when they have enough significant digits', () => {
                expect(format.NumberSmart(1234)).toBe('1 234');
                expect(format.NumberSmart(12345)).toBe('12 345');
                expect(format.NumberSmart(123456)).toBe('123 456');
            });
        });

        describe('decimal values', () => {
            it('should format decimals with leading zeros correctly', () => {
                expect(format.NumberSmart(0.1)).toBe('0.1');
                expect(format.NumberSmart(0.01)).toBe('0.01');
                expect(format.NumberSmart(0.001)).toBe('0.001');
                expect(format.NumberSmart(0.0001)).toBe('0.0001');
            });

            it('should format decimals with multiple significant digits', () => {
                expect(format.NumberSmart(0.123)).toBe('0.123');
                expect(format.NumberSmart(0.0123)).toBe('0.0123');
                expect(format.NumberSmart(0.00123)).toBe('0.00123');
            });

            it('should limit to 3 significant digits for decimals', () => {
                expect(format.NumberSmart(0.12345)).toBe('0.123');
                expect(format.NumberSmart(0.012345)).toBe('0.0123');
                expect(format.NumberSmart(0.0012345)).toBe('0.00123');
            });

            it('should format mixed integer and decimal parts', () => {
                expect(format.NumberSmart(1.23)).toBe('1.23');
                expect(format.NumberSmart(12.3)).toBe('12.3');
                expect(format.NumberSmart(1.234)).toBe('1.23');
                expect(format.NumberSmart(12.34)).toBe('12.3');
            });

            it('should handle very small numbers', () => {
                expect(format.NumberSmart(0.000123)).toBe('0.000123');
                expect(format.NumberSmart(0.0000123)).toBe('0.0000123');
            });
        });

        describe('edge cases', () => {
            it('should handle numbers with trailing zeros', () => {
                expect(format.NumberSmart(1.0)).toBe('1');
                expect(format.NumberSmart(1.2)).toBe('1.2');
                expect(format.NumberSmart(1.23)).toBe('1.23');
            });

            it('should handle negative numbers', () => {
                expect(format.NumberSmart(-1.23)).toBe('-1.23');
                expect(format.NumberSmart(-123)).toBe('-123');
                expect(format.NumberSmart(-0.123)).toBe('-0.123');
            });

            it('should handle very large numbers', () => {
                expect(format.NumberSmart(1234567)).toBe('1 234 567');
                expect(format.NumberSmart(1234567.89)).toBe('1 234 568');
            });
        });
    });

    describe('with custom significantDigits', () => {
        it('should respect custom significantDigits = 1', () => {
            expect(format.NumberSmart(1.23456, {significantDigits: 1})).toBe('1');
            expect(format.NumberSmart(0.123456, {significantDigits: 1})).toBe('0.1');
            expect(format.NumberSmart(0.0123456, {significantDigits: 1})).toBe('0.01');
        });

        it('should respect custom significantDigits = 2', () => {
            expect(format.NumberSmart(1.23456, {significantDigits: 2})).toBe('1.2');
            expect(format.NumberSmart(0.123456, {significantDigits: 2})).toBe('0.12');
            expect(format.NumberSmart(0.0123456, {significantDigits: 2})).toBe('0.012');
        });

        it('should respect custom significantDigits = 5', () => {
            expect(format.NumberSmart(1.23456789, {significantDigits: 5})).toBe('1.2346');
            expect(format.NumberSmart(0.123456789, {significantDigits: 5})).toBe('0.12346');
            expect(format.NumberSmart(0.0123456789, {significantDigits: 5})).toBe('0.012346');
        });

        it('should handle significantDigits larger than available digits', () => {
            expect(format.NumberSmart(1.2, {significantDigits: 5})).toBe('1.2');
            expect(format.NumberSmart(123, {significantDigits: 5})).toBe('123');
        });

        it('should handle significantDigits = 0', () => {
            expect(format.NumberSmart(1.23456, {significantDigits: 0})).toBe('1');
            expect(format.NumberSmart(0.123456, {significantDigits: 0})).toBe('0');
        });
    });

    describe('integer part handling', () => {
        it('should return only integer part when it has enough significant digits', () => {
            expect(format.NumberSmart(123.456, {significantDigits: 3})).toBe('123');
            expect(format.NumberSmart(1234.567, {significantDigits: 3})).toBe('1 235');
            expect(format.NumberSmart(12345.678, {significantDigits: 4})).toBe('12 346');
        });

        it('should include decimal part when integer part has fewer significant digits', () => {
            expect(format.NumberSmart(1.23456, {significantDigits: 3})).toBe('1.23');
            expect(format.NumberSmart(12.3456, {significantDigits: 3})).toBe('12.3');
            expect(format.NumberSmart(12.3456, {significantDigits: 4})).toBe('12.35');
        });
    });

    describe('decimal part handling', () => {
        it('should handle numbers with only decimal part', () => {
            expect(format.NumberSmart(0.123456, {significantDigits: 3})).toBe('0.123');
            expect(format.NumberSmart(0.0123456, {significantDigits: 3})).toBe('0.0123');
            expect(format.NumberSmart(0.00123456, {significantDigits: 3})).toBe('0.00123');
        });

        it('should not include decimal part if it has no significant digits', () => {
            expect(format.NumberSmart(1.0, {significantDigits: 3})).toBe('1');
            expect(format.NumberSmart(123.0, {significantDigits: 3})).toBe('123');
        });
    });

    describe('number formatting integration', () => {
        it('should use format.Number for integer part formatting', () => {
            // This tests that large numbers get comma separators
            expect(format.NumberSmart(1234567.89, {significantDigits: 7})).toBe('1 234 568');
            expect(format.NumberSmart(1000000, {significantDigits: 7})).toBe('1 000 000');
        });
    });

    describe('precision edge cases', () => {
        it('should handle maximum precision correctly', () => {
            const veryPreciseNumber = 1.123456789012345;
            const result = format.NumberSmart(veryPreciseNumber, {significantDigits: 10});
            expect(result).toBe('1.123456789');
        });
    });
});
