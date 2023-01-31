const ypath = require('./ypath');

describe('YPath', () => {
    const NAVIGATE_CHILD = 0;
    const NAVIGATE_ATTRIBUTE = 1;

    it('isObject', () => {
        expect(ypath).toBeInstanceOf(Object);
    });

    describe('_next', () => {
        const _next = ypath._next;

        it('Exports', () => {
            expect(_next).toBeDefined();
        });

        it('isFunction', () => {
            expect(_next).toBeInstanceOf(Function);
        });

        it('gets next child', () => {
            const action = _next('/home');

            expect(action).toMatchObject({
                action: NAVIGATE_CHILD,
                name: 'home',
                subpath: '',
            });
        });

        it('gets next attribute', () => {
            const action = _next('/@state');

            expect(action).toMatchObject({
                action: NAVIGATE_ATTRIBUTE,
                name: 'state',
                subpath: '',
            });
        });

        it('correctly handles special escapes', () => {
            const action = _next('/\\/\\@\\*\\&\\{\\[');

            expect(action).toMatchObject({
                action: NAVIGATE_CHILD,
                name: '\\/\\@\\*\\&\\{\\[',
                subpath: '',
            });
        });

        it('validates ypath', () => {
            expect(() => {
                _next('foo');
            }).toThrow();
        });
    });

    describe('get', () => {
        const _get = ypath.get;

        it('Exports', () => {
            expect(_get).toBeDefined();
        });

        it('isFunction', () => {
            expect(_get).toBeInstanceOf(Function);
        });

        it('Works', () => {
            const node = {
                items: [
                    'apple',
                    {
                        $attributes: {
                            type: 'citrus',
                        },
                        $value: 'orange',
                    },
                ],
                path: {
                    $value: '//home/user/table',
                },
            };
            expect(_get(node, '/items')).toBe(node.items);
            expect(_get(node, '/items/1')).toBe(node.items[1]);
            expect(_get(node, '/items/1/@type')).toBe(node.items[1].$attributes.type);

            expect(_get(node, '/path')).toBe(node.path);
            expect(_get(node, '/path/@append')).toBe(undefined);

            expect(_get(node, '/path/@')).toEqual({});
        });
    });

    describe('contructor', () => {
        const _ypath = ypath.YPath;
        const _parseRelative = _ypath.parseRelative;
        const _parseAbsolute = _ypath.parseAbsolute;
        const _fragmentToYSON = _ypath.fragmentToYSON;
        const _fragmentFromYSON = _ypath.fragmentFromYSON;

        it('Exports', () => {
            expect(_ypath).toBeDefined();
        });

        it('isFunction', () => {
            expect(_ypath).toBeInstanceOf(Function);
        });

        describe('static parseRelative', () => {
            it('Exports', () => {
                expect(_parseRelative).toBeDefined();
            });

            it('isFunction', () => {
                expect(_parseRelative).toBeInstanceOf(Function);
            });

            it('works', () => {
                expect(_parseRelative('/foo')).toEqual([
                    {
                        action: NAVIGATE_CHILD,
                        name: 'foo',
                    },
                ]);

                expect(_parseRelative('/home/username/table')).toEqual([
                    {
                        action: NAVIGATE_CHILD,
                        name: 'home',
                    },
                    {
                        action: NAVIGATE_CHILD,
                        name: 'username',
                    },
                    {
                        action: NAVIGATE_CHILD,
                        name: 'table',
                    },
                ]);

                expect(_parseRelative('/@bar')).toEqual([
                    {
                        action: NAVIGATE_ATTRIBUTE,
                        name: 'bar',
                    },
                ]);
            });

            it('handles special escapes', () => {
                const path = '\\/\\@\\&\\*\\{\\[';

                expect(_parseRelative('/' + path)).toEqual([
                    {
                        action: NAVIGATE_CHILD,
                        name: path,
                    },
                ]);
            });

            it('handles hex escapes', () => {
                const path =
                    '\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\x09\\x0a\\x0b\\x0c\\x0d\\x0e\\x0f' +
                    '\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f' +
                    '\\x20\\x21\\x22\\x23\\x24\\x25\\x26\\x27\\x28\\x29\\x2a\\x2b\\x2c\\x2d\\x2e\\x2f' +
                    '\\x30\\x31\\x32\\x33\\x34\\x35\\x36\\x37\\x38\\x39\\x3a\\x3b\\x3c\\x3d\\x3e\\x3f' +
                    '\\x40\\x41\\x42\\x43\\x44\\x45\\x46\\x47\\x48\\x49\\x4a\\x4b\\x4c\\x4d\\x4e\\x4f' +
                    '\\x50\\x51\\x52\\x53\\x54\\x55\\x56\\x57\\x58\\x59\\x5a\\x5b\\x5c\\x5d\\x5e\\x5f' +
                    '\\x60\\x61\\x62\\x63\\x64\\x65\\x66\\x67\\x68\\x69\\x6a\\x6b\\x6c\\x6d\\x6e\\x6f' +
                    '\\x70\\x71\\x72\\x73\\x74\\x75\\x76\\x77\\x78\\x79\\x7a\\x7b\\x7c\\x7d\\x7e\\x7f' +
                    '\\x80\\x81\\x82\\x83\\x84\\x85\\x86\\x87\\x88\\x89\\x8a\\x8b\\x8c\\x8d\\x8e\\x8f' +
                    '\\x90\\x91\\x92\\x93\\x94\\x95\\x96\\x97\\x98\\x99\\x9a\\x9b\\x9c\\x9d\\x9e\\x9f' +
                    '\\xa0\\xa1\\xa2\\xa3\\xa4\\xa5\\xa6\\xa7\\xa8\\xa9\\xaa\\xab\\xac\\xad\\xae\\xaf' +
                    '\\xb0\\xb1\\xb2\\xb3\\xb4\\xb5\\xb6\\xb7\\xb8\\xb9\\xba\\xbb\\xbc\\xbd\\xbe\\xbf' +
                    '\\xc0\\xc1\\xc2\\xc3\\xc4\\xc5\\xc6\\xc7\\xc8\\xc9\\xca\\xcb\\xcc\\xcd\\xce\\xcf' +
                    '\\xd0\\xd1\\xd2\\xd3\\xd4\\xd5\\xd6\\xd7\\xd8\\xd9\\xda\\xdb\\xdc\\xdd\\xde\\xdf' +
                    '\\xe0\\xe1\\xe2\\xe3\\xe4\\xe5\\xe6\\xe7\\xe8\\xe9\\xea\\xeb\\xec\\xed\\xee\\xef' +
                    '\\xf0\\xf1\\xf2\\xf3\\xf4\\xf5\\xf6\\xf7\\xf8\\xf9\\xfa\\xfb\\xfc\\xfd\\xfe';

                expect(_parseRelative('/' + path)).toEqual([
                    {
                        action: NAVIGATE_CHILD,
                        name: path,
                    },
                ]);
            });
        });

        describe('static parseAbsolute', () => {
            it('Exports', () => {
                expect(_parseAbsolute).toBeDefined();
            });

            it('isFunction', () => {
                expect(_parseAbsolute).toBeInstanceOf(Function);
            });

            it('works', () => {
                expect(_parseAbsolute('//home/username/table/@dynamic')).toEqual([
                    {
                        root: 'tree-root',
                        name: '/',
                    },
                    {
                        action: NAVIGATE_CHILD,
                        name: 'home',
                    },
                    {
                        action: NAVIGATE_CHILD,
                        name: 'username',
                    },
                    {
                        action: NAVIGATE_CHILD,
                        name: 'table',
                    },
                    {
                        action: NAVIGATE_ATTRIBUTE,
                        name: 'dynamic',
                    },
                ]);
            });

            it('handles tree root', () => {
                expect(_parseAbsolute('/')).toEqual([
                    {
                        root: 'tree-root',
                        name: '/',
                    },
                ]);
            });

            it('handles object root', () => {
                expect(_parseAbsolute('#2ea7-189e7a-3ff012f-2fca47bf')).toEqual([
                    {
                        root: 'object-root',
                        name: '#2ea7-189e7a-3ff012f-2fca47bf',
                    },
                ]);
            });
        });

        describe('static fragmentToYSON', () => {
            it('Exports', () => {
                expect(_fragmentToYSON).toBeDefined();
            });

            it('isFunction', () => {
                expect(_fragmentToYSON).toBeInstanceOf(Function);
            });

            it('works', () => {
                expect(_fragmentToYSON('\\/\\@\\&\\*\\{\\[')).toBe('/@&*{[');

                expect(_fragmentToYSON('}]')).toBe('}]');

                expect(
                    _fragmentToYSON(
                        '\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\x09\\x0a\\x0b\\x0c\\x0d\\x0e\\x0f' +
                            '\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f' +
                            '\\x20\\x21\\x22\\x23\\x24\\x25\\x26\\x27\\x28\\x29\\x2a\\x2b\\x2c\\x2d\\x2e\\x2f' +
                            '\\x30\\x31\\x32\\x33\\x34\\x35\\x36\\x37\\x38\\x39\\x3a\\x3b\\x3c\\x3d\\x3e\\x3f' +
                            '\\x40\\x41\\x42\\x43\\x44\\x45\\x46\\x47\\x48\\x49\\x4a\\x4b\\x4c\\x4d\\x4e\\x4f' +
                            '\\x50\\x51\\x52\\x53\\x54\\x55\\x56\\x57\\x58\\x59\\x5a\\x5b\\x5c\\x5d\\x5e\\x5f' +
                            '\\x60\\x61\\x62\\x63\\x64\\x65\\x66\\x67\\x68\\x69\\x6a\\x6b\\x6c\\x6d\\x6e\\x6f' +
                            '\\x70\\x71\\x72\\x73\\x74\\x75\\x76\\x77\\x78\\x79\\x7a\\x7b\\x7c\\x7d\\x7e\\x7f' +
                            '\\x80\\x81\\x82\\x83\\x84\\x85\\x86\\x87\\x88\\x89\\x8a\\x8b\\x8c\\x8d\\x8e\\x8f' +
                            '\\x90\\x91\\x92\\x93\\x94\\x95\\x96\\x97\\x98\\x99\\x9a\\x9b\\x9c\\x9d\\x9e\\x9f' +
                            '\\xa0\\xa1\\xa2\\xa3\\xa4\\xa5\\xa6\\xa7\\xa8\\xa9\\xaa\\xab\\xac\\xad\\xae\\xaf' +
                            '\\xb0\\xb1\\xb2\\xb3\\xb4\\xb5\\xb6\\xb7\\xb8\\xb9\\xba\\xbb\\xbc\\xbd\\xbe\\xbf' +
                            '\\xc0\\xc1\\xc2\\xc3\\xc4\\xc5\\xc6\\xc7\\xc8\\xc9\\xca\\xcb\\xcc\\xcd\\xce\\xcf' +
                            '\\xd0\\xd1\\xd2\\xd3\\xd4\\xd5\\xd6\\xd7\\xd8\\xd9\\xda\\xdb\\xdc\\xdd\\xde\\xdf' +
                            '\\xe0\\xe1\\xe2\\xe3\\xe4\\xe5\\xe6\\xe7\\xe8\\xe9\\xea\\xeb\\xec\\xed\\xee\\xef' +
                            '\\xf0\\xf1\\xf2\\xf3\\xf4\\xf5\\xf6\\xf7\\xf8\\xf9\\xfa\\xfb\\xfc\\xfd\\xfe',
                    ),
                ).toBe(
                    '\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f' +
                        '\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f' +
                        '\u0020\u0021\u0022\u0023\u0024\u0025\u0026\u0027\u0028\u0029\u002a\u002b\u002c\u002d\u002e\u002f' +
                        '\u0030\u0031\u0032\u0033\u0034\u0035\u0036\u0037\u0038\u0039\u003a\u003b\u003c\u003d\u003e\u003f' +
                        '\u0040\u0041\u0042\u0043\u0044\u0045\u0046\u0047\u0048\u0049\u004a\u004b\u004c\u004d\u004e\u004f' +
                        '\u0050\u0051\u0052\u0053\u0054\u0055\u0056\u0057\u0058\u0059\u005a\u005b\u005c\u005d\u005e\u005f' +
                        '\u0060\u0061\u0062\u0063\u0064\u0065\u0066\u0067\u0068\u0069\u006a\u006b\u006c\u006d\u006e\u006f' +
                        '\u0070\u0071\u0072\u0073\u0074\u0075\u0076\u0077\u0078\u0079\u007a\u007b\u007c\u007d\u007e\u007f' +
                        '\u0080\u0081\u0082\u0083\u0084\u0085\u0086\u0087\u0088\u0089\u008a\u008b\u008c\u008d\u008e\u008f' +
                        '\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009a\u009b\u009c\u009d\u009e\u009f' +
                        '\u00a0\u00a1\u00a2\u00a3\u00a4\u00a5\u00a6\u00a7\u00a8\u00a9\u00aa\u00ab\u00ac\u00ad\u00ae\u00af' +
                        '\u00b0\u00b1\u00b2\u00b3\u00b4\u00b5\u00b6\u00b7\u00b8\u00b9\u00ba\u00bb\u00bc\u00bd\u00be\u00bf' +
                        '\u00c0\u00c1\u00c2\u00c3\u00c4\u00c5\u00c6\u00c7\u00c8\u00c9\u00ca\u00cb\u00cc\u00cd\u00ce\u00cf' +
                        '\u00d0\u00d1\u00d2\u00d3\u00d4\u00d5\u00d6\u00d7\u00d8\u00d9\u00da\u00db\u00dc\u00dd\u00de\u00df' +
                        '\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5\u00e6\u00e7\u00e8\u00e9\u00ea\u00eb\u00ec\u00ed\u00ee\u00ef' +
                        '\u00f0\u00f1\u00f2\u00f3\u00f4\u00f5\u00f6\u00f7\u00f8\u00f9\u00fa\u00fb\u00fc\u00fd\u00fe',
                );
            });
        });

        describe('static fragmentFromYSON', () => {
            it('Exports', () => {
                expect(_fragmentFromYSON).toBeDefined();
            });

            it('isFunction', () => {
                expect(_fragmentFromYSON).toBeInstanceOf(Function);
            });

            it('works', () => {
                expect(_fragmentFromYSON('/@&*{[')).toBe('\\/\\@\\&\\*\\{\\[');

                expect(_fragmentFromYSON('}]')).toBe('}]');

                expect(
                    _fragmentFromYSON(
                        '\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f' +
                            '\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f' +
                            '\u0020\u0021\u0022\u0023\u0024\u0025\u0026\u0027\u0028\u0029\u002a\u002b\u002c\u002d\u002e\u002f' +
                            '\u0030\u0031\u0032\u0033\u0034\u0035\u0036\u0037\u0038\u0039\u003a\u003b\u003c\u003d\u003e\u003f' +
                            '\u0040\u0041\u0042\u0043\u0044\u0045\u0046\u0047\u0048\u0049\u004a\u004b\u004c\u004d\u004e\u004f' +
                            '\u0050\u0051\u0052\u0053\u0054\u0055\u0056\u0057\u0058\u0059\u005a\u005b\u005c\u005d\u005e\u005f' +
                            '\u0060\u0061\u0062\u0063\u0064\u0065\u0066\u0067\u0068\u0069\u006a\u006b\u006c\u006d\u006e\u006f' +
                            '\u0070\u0071\u0072\u0073\u0074\u0075\u0076\u0077\u0078\u0079\u007a\u007b\u007c\u007d\u007e\u007f' +
                            '\u0080\u0081\u0082\u0083\u0084\u0085\u0086\u0087\u0088\u0089\u008a\u008b\u008c\u008d\u008e\u008f' +
                            '\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009a\u009b\u009c\u009d\u009e\u009f' +
                            '\u00a0\u00a1\u00a2\u00a3\u00a4\u00a5\u00a6\u00a7\u00a8\u00a9\u00aa\u00ab\u00ac\u00ad\u00ae\u00af' +
                            '\u00b0\u00b1\u00b2\u00b3\u00b4\u00b5\u00b6\u00b7\u00b8\u00b9\u00ba\u00bb\u00bc\u00bd\u00be\u00bf' +
                            '\u00c0\u00c1\u00c2\u00c3\u00c4\u00c5\u00c6\u00c7\u00c8\u00c9\u00ca\u00cb\u00cc\u00cd\u00ce\u00cf' +
                            '\u00d0\u00d1\u00d2\u00d3\u00d4\u00d5\u00d6\u00d7\u00d8\u00d9\u00da\u00db\u00dc\u00dd\u00de\u00df' +
                            '\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5\u00e6\u00e7\u00e8\u00e9\u00ea\u00eb\u00ec\u00ed\u00ee\u00ef' +
                            '\u00f0\u00f1\u00f2\u00f3\u00f4\u00f5\u00f6\u00f7\u00f8\u00f9\u00fa\u00fb\u00fc\u00fd\u00fe',
                    ),
                ).toBe(
                    '\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\x09\\x0a\\x0b\\x0c\\x0d\\x0e\\x0f' +
                        '\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f' +
                        ' !"#$%\\&\'()\\*+,-.\\/0123456789:;<=>?\\@' +
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZ\\[\\\\]^_`abcdefghijklmnopqrstuvwxyz\\{|}~' +
                        '\\x80\\x81\\x82\\x83\\x84\\x85\\x86\\x87\\x88\\x89\\x8a\\x8b\\x8c\\x8d\\x8e\\x8f' +
                        '\\x90\\x91\\x92\\x93\\x94\\x95\\x96\\x97\\x98\\x99\\x9a\\x9b\\x9c\\x9d\\x9e\\x9f' +
                        '\\xa0\\xa1\\xa2\\xa3\\xa4\\xa5\\xa6\\xa7\\xa8\\xa9\\xaa\\xab\\xac\\xad\\xae\\xaf' +
                        '\\xb0\\xb1\\xb2\\xb3\\xb4\\xb5\\xb6\\xb7\\xb8\\xb9\\xba\\xbb\\xbc\\xbd\\xbe\\xbf' +
                        '\\xc0\\xc1\\xc2\\xc3\\xc4\\xc5\\xc6\\xc7\\xc8\\xc9\\xca\\xcb\\xcc\\xcd\\xce\\xcf' +
                        '\\xd0\\xd1\\xd2\\xd3\\xd4\\xd5\\xd6\\xd7\\xd8\\xd9\\xda\\xdb\\xdc\\xdd\\xde\\xdf' +
                        '\\xe0\\xe1\\xe2\\xe3\\xe4\\xe5\\xe6\\xe7\\xe8\\xe9\\xea\\xeb\\xec\\xed\\xee\\xef' +
                        '\\xf0\\xf1\\xf2\\xf3\\xf4\\xf5\\xf6\\xf7\\xf8\\xf9\\xfa\\xfb\\xfc\\xfd\\xfe',
                );
            });
        });
    });
});
