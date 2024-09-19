module.exports = {
    validate: {
        // add webpack plugin with rules
        plugins: ['@statoscope/webpack'],
        reporters: [
            // console-reporter to output results into console (enabled by default)
            '@statoscope/console',
            // reporter that generates UI-report with validation-results
            ['@statoscope/stats-report', {saveStatsTo: 'validated.json'}],
        ],
        // rules to validate your stats (use all of them or only specific rules)
        rules: {
            // ensures that bundle hasn't package duplicates
            // TODO: akaretnikov@ вернуть no-packages-dups после дедупликации пакетов
            '@statoscope/webpack/no-packages-dups': [
                'error',
                {
                    exclude: ['react-is', 'redux', 'screenfull'],
                },
            ],
            // ensure that the download time of entrypoints is not over the limit (10 sec)
            // '@statoscope/webpack/entry-download-time-limits': [
            //     'error',
            //     {global: {maxDownloadTime: 10000}},
            // ],
            // ensure that the download size of entrypoints is not over the limit (20 mb)
            // it includes async chunks so is not that important, therefore warn
            '@statoscope/webpack/entry-download-size-limits': [
                'warn',
                {global: {maxSize: 20 * 1024 * 1024}},
            ],
            // ensures that bundle doesn't have modules with deoptimization
            // '@statoscope/webpack/no-modules-deopts': ['warn'],
            // diff download size of entrypoints between input and reference stats. Fails if size diff is over the limit (10 kb)
            '@statoscope/webpack/diff-entry-download-size-limits': [
                'error',
                {byName: [{name: 'main', limits: {maxInitialSizeDiff: 10 * 1024}}]},
            ],
            // diff download time of entrypoints between input and reference stats. Fails if download time is over the limit (500 ms)
            '@statoscope/webpack/diff-entry-download-time-limits': [
                'error',
                {byName: [{name: 'main', limits: {maxInitialDownloadTimeDiff: 500}}]},
            ],
            // compares usage of specified modules between input and reference stats
            // '@statoscope/webpack/diff-deprecated-modules': ['error', [/\/path\/to\/module\.js/]],
            // compares usage of specified packages usage between input and reference stats. Fails if rxjs usage has increased
            // '@statoscope/webpack/diff-deprecated-packages': ['error', ['lodash/chain']],
        },
    },
};
