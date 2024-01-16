import {
    _LOCAL_ARCADIA_VERSION,
    _compareVersions,
    _isFeatureSupported,
    _versionInInterval,
    isSupportedSelector,
} from './support';

describe('support', () => {
    describe('isSupportedSelector', () => {
        let warnMock, _origWarn;
        beforeEach(() => {
            warnMock = jest.fn();
            _origWarn = global.console.warn;
            global.console.warn = warnMock;
        });

        afterEach(() => {
            global.console.warn = _origWarn;
        });

        it('returns the same function if state did not change', () => {
            const isSupported = isSupportedSelector({
                global: {
                    version: '19.2.25251-prestable~3023dc3',
                    schedulerVersion: '20.2.12.14',
                },
            });
            const isSupportedNext = isSupportedSelector({
                global: {
                    version: '19.2.25251-prestable~3023dc3',
                    schedulerVersion: '20.2.12.14',
                },
            });

            expect(isSupported).toBe(isSupportedNext);
        });

        it('local cluster version from arcadia supports all the features', () => {
            const isSupported = _isFeatureSupported(_LOCAL_ARCADIA_VERSION, {
                knownFeature: {
                    prestable: '19.4.29880',
                    component: ['19.3.29880', '-stable-something'],
                },
            });

            expect(isSupported('knownFeature')).toBe(true);
            expect(isSupported('unknownFeature')).toBe(true);
        });

        describe('non-existent facilities', () => {
            it('unknown feature should not be supported and trace should be emitted', () => {
                const isSupported = _isFeatureSupported('some.version', {
                    knownFeature: {
                        prestable: '19.4.29880',
                        component: ['19.4.29880', '-stable-something'],
                    },
                });

                expect(isSupported('unknownFeature')).toBe(false);
                expect(warnMock.mock.calls.length).toBe(1);
            });

            it('unknown component version should not be supported and trace should be emitted', () => {
                const isSupported = _isFeatureSupported('some.version', {
                    knownFeature: {
                        prestable: '19.4.29880',
                        component: undefined,
                    },
                });

                expect(isSupported('knownFeature')).toBe(false);
                expect(warnMock.mock.calls.length).toBe(1);
            });
        });

        it('Prestable version supported explicitly', () => {
            const isSupported = _isFeatureSupported('some.version', {
                knownFeature: {
                    prestable: '19.2.25000',
                    component: ['19.2.26251', '-prestable~3023dc3'],
                },
            });

            expect(isSupported('knownFeature')).toBe(true);
        });

        describe('Prestable version not supported implicitly, stable requirement does not work', () => {
            it('does not find prestable fallback and yells to console', () => {
                const isSupported = _isFeatureSupported('some.version', {
                    knownFeature: {
                        stable: '19.2.25000',
                        component: ['19.2.26251', '-prestable~3023dc3'],
                    },
                });

                expect(isSupported('knownFeature')).toBe(false);
                expect(warnMock.mock.calls.length).toBe(1);
            });

            it('finds prestable fallback and does not yell to console', () => {
                const isSupported = _isFeatureSupported('some.version', {
                    knownFeature: {
                        stable: '19.2.25000',
                        prestable: '19.3.25000',
                        component: ['19.2.26251', '-prestable~3023dc3'],
                    },
                });

                expect(isSupported('knownFeature')).toBe(false);
                expect(warnMock.mock.calls.length).toBe(0);
            });
        });

        it('Stable version supported explicitly', () => {
            const isSupported = _isFeatureSupported('some.version', {
                knownFeature: {
                    stable: '19.2.26000',
                    component: ['19.2.26251', '-stable~3023dc3'],
                },
            });

            expect(isSupported('knownFeature')).toBe(true);
        });

        it('Stable version supported implicitly, by requirement for prestable', () => {
            const isSupported = _isFeatureSupported('some.version', {
                knownFeature: {
                    prestable: '19.2.25000',
                    component: ['19.2.26251', '-stable~3023dc3'],
                },
            });

            expect(isSupported('knownFeature')).toBe(true);
        });

        it('Multiple version intervals', () => {
            const isSupported = _isFeatureSupported('some.version', {
                knownFeature: {
                    prestable: [
                        {greater: '19.2.26123', smaller: '19.3.00000'},
                        {greater: '19.3.25000'},
                    ],
                    component: ['19.3.25251', '-prestable~3023dc3'],
                },
            });

            expect(isSupported('knownFeature')).toBe(true);
        });
    });

    describe('_versionInInterval', () => {
        it('Simple interval', () => {
            expect(_versionInInterval('19.2.25251-prestable~3023dc3', '19.2.25000')).toBe(true);

            expect(_versionInInterval('19.2.25251-prestable~3023dc3', '19.2.26000')).toBe(false);
        });

        it('Object interval', () => {
            expect(_versionInInterval('19.2.25251', {greater: '19.2.25000'})).toBe(true);
            expect(
                _versionInInterval('19.2.25251', {
                    greater: '19.2.25000',
                    smaller: '19.3.00000',
                }),
            ).toBe(true);
            expect(
                _versionInInterval('19.2.25251', {
                    greater: '19.2.26000',
                    smaller: '19.3.00000',
                }),
            ).toBe(false);
            expect(_versionInInterval('19.2.25251', {greater: '19.2.26000'})).toBe(false);
            expect(_versionInInterval('19.2.25251', {smaller: '19.3.00000'})).toBe(true);
            expect(_versionInInterval('19.2.25251', {smaller: '19.2.00000'})).toBe(false);
        });
    });

    describe('compareVersions', () => {
        it('Works', () => {
            expect(_compareVersions('greater', '19.2.26000', '19.2.25251')).toBe(true);
            expect(_compareVersions('smaller', '19.2.25000', '19.2.25251')).toBe(true);
        });

        it('left end included, right end excluded', () => {
            expect(_compareVersions('greater', '19.2.25251', '19.2.25251')).toBe(true);
            expect(_compareVersions('smaller', '19.2.25251', '19.2.25251')).toBe(false);
        });
    });
});
