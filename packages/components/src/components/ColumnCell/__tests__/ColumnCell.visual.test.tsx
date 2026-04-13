import {type ComponentProps, type ReactElement} from 'react';

import {test} from '../../../playwright-components/core';

import {ColumnCell} from '../ColumnCell';
import {columnCellStoryBaseArgsForVisual, columnCellStoryFrameStyle} from '../columnCellStorySetup';

const noopPreview = () => {};

const columnCellBaseProps = {
    ...columnCellStoryBaseArgsForVisual,
    logError: () => undefined,
} as unknown as ComponentProps<typeof ColumnCell>;

const columnCellVisualTree = (cell: ReactElement) => (
    <div style={columnCellStoryFrameStyle}>{cell}</div>
);

test('ColumnCell: Default', async ({mount, expectScreenshot}) => {
    await mount(
        columnCellVisualTree(<ColumnCell {...columnCellBaseProps} onShowPreview={noopPreview} />),
    );
    await expectScreenshot();
});

test('ColumnCell: YqlInt64', async ({mount, expectScreenshot}) => {
    await mount(
        columnCellVisualTree(
            <ColumnCell
                {...columnCellBaseProps}
                value={[42, 0]}
                yqlTypes={[['DataType', 'Int64']]}
                onShowPreview={noopPreview}
            />,
        ),
    );
    await expectScreenshot();
});

test('ColumnCell: YsonNumber', async ({mount, expectScreenshot}) => {
    await mount(
        columnCellVisualTree(
            <ColumnCell
                {...columnCellBaseProps}
                yqlTypes={null}
                useYqlTypes={false}
                value={42}
                onShowPreview={noopPreview}
            />,
        ),
    );
    await expectScreenshot();
});

test('ColumnCell: IncompleteYson', async ({mount, expectScreenshot}) => {
    await mount(
        columnCellVisualTree(
            <ColumnCell
                {...columnCellBaseProps}
                yqlTypes={null}
                useYqlTypes={false}
                value={{$incomplete: true, $value: 'Truncated…'}}
                onShowPreview={noopPreview}
            />,
        ),
    );
    await expectScreenshot();
});

test('ColumnCell: RawString', async ({mount, expectScreenshot}) => {
    await mount(
        columnCellVisualTree(
            <ColumnCell
                {...columnCellBaseProps}
                yqlTypes={null}
                useYqlTypes={false}
                allowRawStrings
                value={{$type: 'string', $value: '"hello"'}}
                onShowPreview={noopPreview}
            />,
        ),
    );
    await expectScreenshot();
});
