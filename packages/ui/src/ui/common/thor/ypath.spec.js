import _ypath from './ypath';

describe('./ypath', () => {
    it('Exports', () => {
        expect(_ypath).toBeDefined();
    });

    it('isObject', () => {
        expect(_ypath).toBeObject();
    });

    describe('getValue', () => {
        it('null is treated as an error if encountered in the middle', () => {
            const node = {
                $value: null,
                $attributes: {
                    recursive_resource_usage: null,
                },
            };

            expect(() => {
                _ypath.getValue(node, '/some_property');
            }).toThrow(Error);

            expect(() => {
                _ypath.getValue(node, '/@recursive_resource_usage');
            }).not.toThrow();
        });
    });

    describe('getBoolean', () => {
        it('gets boolean from boolean', () => {
            const node = {
                $value: '//home/user/table',
                $attributes: {
                    append: true,
                    teleport: false,
                },
            };

            expect(_ypath.getBoolean(node, '/@append')).toBe(true);
            expect(_ypath.getBoolean(node, '/@teleport')).toBe(false);
        });

        it('gets boolean from string', () => {
            const node = {
                $value: '//home/user/table',
                $attributes: {
                    append: 'true',
                    teleport: 'false',
                },
            };

            expect(_ypath.getBoolean(node, '/@append')).toBe(true);
            expect(_ypath.getBoolean(node, '/@teleport')).toBe(false);
        });

        it('plays well with undefined', () => {
            const node = {
                $value: '//home/user/table',
                $attributes: {
                    append: undefined,
                    teleport: undefined,
                },
            };

            expect(_ypath.getBoolean(node, '/@append')).toBeUndefined();
            expect(_ypath.getBoolean(node, '/@teleport')).toBeUndefined();
        });

        it('everything else is treated as an error', () => {
            const node = {
                $value: '//home/user/table',
                $attributes: {
                    append: 'foo',
                    teleport: 'foo',
                },
            };

            expect(() => {
                _ypath.getBoolean(node, '/@append');
            }).toThrow(Error);
            expect(() => {
                _ypath.getBoolean(node, '/@teleport');
            }).toThrow(Error);
        });
    });
});
