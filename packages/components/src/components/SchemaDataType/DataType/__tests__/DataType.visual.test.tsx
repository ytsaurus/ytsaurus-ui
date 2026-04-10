import {type ReactElement} from 'react';

import {test} from '../../../../playwright-components/core';

import {DataType} from '../DataType';
import {
    dataTypeStoryExamples,
    dataTypeStoryFrameStyle,
    dataTypeVisualStoryCaseOrder,
} from '../dataTypeStorySetup';

const dataTypeVisualTree = (node: ReactElement) => (
    <div style={dataTypeStoryFrameStyle}>{node}</div>
);

for (const key of dataTypeVisualStoryCaseOrder) {
    test(`DataType: ${key}`, async ({mount, expectScreenshot}) => {
        await mount(dataTypeVisualTree(<DataType {...dataTypeStoryExamples[key]} />));
        await expectScreenshot();
    });
}
