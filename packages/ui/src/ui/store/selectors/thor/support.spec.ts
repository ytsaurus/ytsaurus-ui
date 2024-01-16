import {
    _LOCAL_ARCADIA_VERSION,
    _compareVersions,
    _isFeatureSupported,
    _versionInInterval,
    isSupportedSelector,
} from './support';

describe('support', () => {
    describe('isSupportedSelector', () => {
        let warnMock: any, _origWarn: any;
        beforeEach(() => {
            warnMock = jest.fn();
            _origWarn = global.console.warn;
            global.console.warn = warnMock;
        });

        afterEach(() => {
            global.console.warn = _origWarn as any;
        });

        it('returns the same function if state did not change', () => {
            const isSupported = isSupportedSelector({
                global: {
                    version: '19.2.25251-prestable~3023dc3',
                    schedulerVersion: '20.2.12-local~123123',
                    masterVersion: '21.123.321-stable~123',
                },
            } as any);
            const isSupportedNext = isSupportedSelector({
                global: {
                    version: '19.2.25251-prestable~3023dc3',
                    schedulerVersion: '20.2.12-local~123123',
                    masterVersion: '21.123.321-stable~123',
                },
            } as any);

            expect(isSupported).toBe(isSupportedNext);
        });

        it('local cluster version from arcadia supports all the features', () => {
            const isSupported = _isFeatureSupported(
                {proxy: _LOCAL_ARCADIA_VERSION},
                {
                    knownFeature: {
                        proxy: '19.4.29880',
                    },
                },
            );

            expect(isSupported('knownFeature')).toBe(true);
            expect(isSupported('unknownFeature' as any)).toBe(false);
        });

        describe('non-existent facilities', () => {
            it('unknown feature should not be supported and trace should be emitted', () => {
                const isSupported = _isFeatureSupported(
                    {proxy: '19.4.29880-stable-something'},
                    {
                        knownFeature: {
                            proxy: '19.4.29880',
                        },
                    },
                );

                expect(isSupported('unknownFeature' as any)).toBe(false);
                expect(warnMock.mock.calls.length).toBe(1);
            });

            it('unknown component version should not be supported and trace should be emitted', () => {
                const isSupported = _isFeatureSupported(
                    {},
                    {
                        knownFeature: {
                            proxy: '19.4.29880',
                        },
                    },
                );

                expect(isSupported('knownFeature')).toBe(false);
                expect(warnMock.mock.calls.length).toBe(1);
            });
        });

        it('Prestable version supported explicitly', () => {
            const isSupported = _isFeatureSupported(
                {proxy: '19.2.26251-prestable~3023dc3'},
                {
                    knownFeature: {
                        proxy: '19.2.25000',
                    },
                },
            );

            expect(isSupported('knownFeature')).toBe(true);
        });

        it('Stable version supported explicitly', () => {
            const isSupported = _isFeatureSupported(
                {proxy: '19.2.26251-stable~3023dc3', scheduler: '19.2.26251-stable~3023dc3'},
                {
                    proxyFeature: {
                        proxy: '19.2.26000',
                    },
                    schedulerFeature: {
                        scheduler: '20.1.23456',
                    },
                },
            );

            expect(isSupported('proxyFeature')).toBe(true);
            expect(isSupported('schedulerFeature')).toBe(false);
        });

        it('Stable version supported implicitly, by requirement for prestable', () => {
            const isSupported = _isFeatureSupported(
                {proxy: '19.2.26251-stable~3023dc3'},
                {
                    knownFeature: {
                        proxy: '19.2.25000',
                    },
                },
            );

            expect(isSupported('knownFeature')).toBe(true);
        });

        describe('Multiple versions of proxy', () => {
            function makeMultiFeatures() {
                return {
                    knownFeature: {
                        proxy: [
                            {greater: '19.2.26123', smaller: '19.3.00000'} as const,
                            {greater: '19.3.25000'} as const,
                        ],
                    },
                };
            }

            it('should be false for versions less than 19.2.26123', () => {
                const isSupported = _isFeatureSupported(
                    {proxy: '10.2.35251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(false);
            });

            it('should be true for versions in [19.2.26123; 19.3.0)', () => {
                const isSupported = _isFeatureSupported(
                    {proxy: '19.2.35251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(true);
            });

            it('should be false for versions in [19.3.0; 19.3.25000)', () => {
                const isSupported = _isFeatureSupported(
                    {proxy: '19.3.15251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(false);
            });

            it('should be false for versions in [19.2.26123; 19.3.0)', () => {
                const isSupported = _isFeatureSupported(
                    {proxy: '19.3.15251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(false);
            });

            it('should be true for versions greater than 19.3.25000', () => {
                const isSupported = _isFeatureSupported(
                    {proxy: '19.3.25251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(true);
            });
        });

        describe('Multiple versions of scheduler', () => {
            function makeMultiFeatures() {
                return {
                    knownFeature: {
                        scheduler: [
                            {greater: '19.2.26123', smaller: '19.3.00000'} as const,
                            {greater: '19.3.25000'} as const,
                        ],
                    },
                };
            }

            it('should be false for versions less than 19.2.26123', () => {
                const isSupported = _isFeatureSupported(
                    {scheduler: '10.2.35251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(false);
            });

            it('should be true for versions in [19.2.26123; 19.3.0)', () => {
                const isSupported = _isFeatureSupported(
                    {scheduler: '19.2.35251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(true);
            });

            it('should be false for versions in [19.3.0; 19.3.25000)', () => {
                const isSupported = _isFeatureSupported(
                    {scheduler: '19.3.15251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(false);
            });

            it('should be false for versions in [19.2.26123; 19.3.0)', () => {
                const isSupported = _isFeatureSupported(
                    {scheduler: '19.3.15251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(false);
            });

            it('should be true for versions greater than 19.3.25000', () => {
                const isSupported = _isFeatureSupported(
                    {scheduler: '19.3.25251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(true);
            });
        });

        describe('Multiple versions of master', () => {
            function makeMultiFeatures() {
                return {
                    knownFeature: {
                        master: [
                            {greater: '19.2.26123', smaller: '19.3.00000'} as const,
                            {greater: '19.3.25000'} as const,
                        ],
                    },
                };
            }

            it('should be false for versions less than 19.2.26123', () => {
                const isSupported = _isFeatureSupported(
                    {master: '10.2.35251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(false);
            });

            it('should be true for versions in [19.2.26123; 19.3.0)', () => {
                const isSupported = _isFeatureSupported(
                    {master: '19.2.35251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(true);
            });

            it('should be false for versions in [19.3.0; 19.3.25000)', () => {
                const isSupported = _isFeatureSupported(
                    {master: '19.3.15251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(false);
            });

            it('should be false for versions in [19.2.26123; 19.3.0)', () => {
                const isSupported = _isFeatureSupported(
                    {master: '19.3.15251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(false);
            });

            it('should be true for versions greater than 19.3.25000', () => {
                const isSupported = _isFeatureSupported(
                    {master: '19.3.25251-prestable~3023dc3'},
                    makeMultiFeatures(),
                );

                expect(isSupported('knownFeature')).toBe(true);
            });
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
