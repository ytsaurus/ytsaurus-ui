import {type ReactElement} from 'react';

import {YtComponentsConfigProvider} from '../../../context';
import {test} from '../../../playwright-components/core';

import {YqlValue} from '../YqlValue';
import {
    defaultYqlValueStorySettings,
    yqlValueStoryBaseArgs,
    yqlValueStoryFrameStyle,
    yqlValueVisualStoryCases,
} from '../yqlValueStorySetup';

const yqlValueVisualTree = (node: ReactElement) => (
    <YtComponentsConfigProvider logError={() => undefined} unipika={defaultYqlValueStorySettings}>
        <div style={yqlValueStoryFrameStyle}>{node}</div>
    </YtComponentsConfigProvider>
);

for (const {testName, args} of yqlValueVisualStoryCases) {
    test(`YqlValue: ${testName}`, async ({mount, expectScreenshot}) => {
        const merged = {...yqlValueStoryBaseArgs, ...args};
        await mount(
            yqlValueVisualTree(
                <YqlValue
                    value={merged.value}
                    type={merged.type}
                    settings={merged.settings}
                    inline={merged.inline}
                />,
            ),
        );
        await expectScreenshot();
    });
}
