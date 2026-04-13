import {test} from '../../../playwright-components/core';

import {YqlValue} from '../YqlValue';
import {
    yqlValueStoryBaseArgs,
    yqlValueStoryFrameStyle,
    yqlValueVisualStoryCases,
} from '../yqlValueStorySetup';

for (const {testName, args} of yqlValueVisualStoryCases) {
    test(`YqlValue: ${testName}`, async ({mount, expectScreenshot}) => {
        const merged = {...yqlValueStoryBaseArgs, ...args};
        await mount(
            <div style={yqlValueStoryFrameStyle}>
                <YqlValue
                    value={merged.value}
                    type={merged.type}
                    settings={merged.settings}
                    inline={merged.inline}
                />
            </div>,
        );
        await expectScreenshot();
    });
}
