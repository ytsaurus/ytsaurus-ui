import React from 'react';

import {type Page} from '@playwright/test';

import {expect, test} from '../../../../../playwright-components/core';

import {FlowGraphStories} from '../__stories__';
import {
    INPUT_ONLY_SINK_NAME,
    INPUT_ONLY_STREAM_NAME,
    ISOLATED_STREAM_NAME,
    MESSAGE_TEXT,
    MULTIPLE_SOURCES,
    SOURCE_NAME,
    backpressuredFlowGraphHandler,
    dataChannelFlowGraphHandler,
    drainedFlowGraphHandler,
    emptyFlowGraphHandler,
    inputOnlyStreamFlowGraphHandler,
    messagesFlowGraphHandler,
    mixedFlowGraphHandler,
    multipleSourcesFlowGraphHandler,
} from '../__stories__/mocks';

test.beforeEach(({browserName}) => {
    test.slow(browserName === 'webkit', 'Flow graph rendering is slower in WebKit');
});

const anchor = 'yt-flow-graph-anchors__computation-anchor';
const summary = 'yt-flow-graph-anchors__summary-inner';

test('FlowGraph: drained anchor', async ({mount, expectScreenshot, page, router}) => {
    await router.use(drainedFlowGraphHandler);
    await mount(<FlowGraphStories.Drained />);

    await expect(page.locator(`.${anchor}`)).toHaveCount(1);
    await expect(page.locator(`.${summary}_drained`)).toHaveCount(1);
    await expect(page.locator(`.${summary}_backpressured`)).toHaveCount(0);
    await expectScreenshot();
});

test('FlowGraph: selected source has full-height selection', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(drainedFlowGraphHandler);
    await mount(<FlowGraphStories.Drained />);

    const source = page.locator('.graph-block-wrapper', {hasText: SOURCE_NAME});
    await source.click();
    await expect(source).toHaveClass(/selected/);

    const popup = page.locator('.yt-flow-graph__item-popup');
    await expect(popup).toBeVisible();
    await expect
        .poll(async () => {
            const [popupBox, sourceBox] = await Promise.all([
                popup.boundingBox(),
                source.boundingBox(),
            ]);
            return Boolean(popupBox && sourceBox && popupBox.y >= sourceBox.y + sourceBox.height);
        })
        .toBe(true);

    const [containerBox, sourceBox] = await Promise.all([
        source.locator('..').boundingBox(),
        source.boundingBox(),
    ]);
    if (!containerBox || !sourceBox) {
        throw new Error('The selected source must have measurable bounds');
    }
    expect(sourceBox.height).toBe(containerBox.height);

    await expectScreenshot();
});

test('FlowGraph: backpressured anchor', async ({mount, expectScreenshot, page, router}) => {
    await router.use(backpressuredFlowGraphHandler);
    await mount(<FlowGraphStories.Backpressured />);

    await expect(page.locator(`.${anchor}`)).toHaveCount(1);
    await expect(page.locator(`.${summary}_drained`)).toHaveCount(0);
    await expect(page.locator(`.${summary}_backpressured`)).toHaveCount(1);
    await expectScreenshot();
});

test('FlowGraph: drained and backpressured anchor', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(mixedFlowGraphHandler);
    await mount(<FlowGraphStories.DrainedAndBackpressured />);

    await expect(page.locator(`.${anchor}`)).toHaveCount(1);
    await expect(page.locator(`.${summary}_drained.${summary}_backpressured`)).toHaveCount(1);
    await expect(page.locator(`.${anchor} .g-icon`)).toHaveCount(1);
    await expectScreenshot();
});

test('FlowGraph: messages-only anchor', async ({mount, expectScreenshot, page, router}) => {
    await router.use(messagesFlowGraphHandler);
    await mount(<FlowGraphStories.MessagesOnly />);

    const messagesAnchor = page.locator(
        `.${summary}:not(.${summary}_drained):not(.${summary}_backpressured)`,
    );
    await expect(messagesAnchor).toHaveCount(1);
    await expect(messagesAnchor.locator('.g-icon')).toHaveCount(1);
    await expectScreenshot();
});

test('FlowGraph: messages dialog', async ({mount, expectScreenshot, page, router}) => {
    await router.use(messagesFlowGraphHandler);
    await mount(<FlowGraphStories.MessagesOnly />);

    const messagesAnchor = page.locator(
        `.${summary}:not(.${summary}_drained):not(.${summary}_backpressured)`,
    );
    await messagesAnchor.click();
    await expect(page.getByText(MESSAGE_TEXT, {exact: true})).toBeVisible();
    await expectScreenshot();
});

test('FlowGraph: anchor without details is hidden', async ({mount, page, router}) => {
    await router.use(emptyFlowGraphHandler);
    await mount(<FlowGraphStories.WithoutDetails />);

    await page.getByText(SOURCE_NAME, {exact: true}).waitFor();
    await expect(page.locator(`.${anchor}`)).toHaveCount(0);
});

test('FlowGraph: input-only stream does not overlap sink', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    test.slow();

    await router.use(inputOnlyStreamFlowGraphHandler);
    await mount(<FlowGraphStories.InputOnlyStream />);

    const graph = page.locator('.yt-flow-graph__graph');
    await graph.hover();
    for (let i = 0; i < 3; ++i) {
        await page.mouse.wheel(0, -700);
    }

    const graphBlocks = page.locator('.graph-block-wrapper');
    const inputOnlyStream = graphBlocks.filter({
        hasText: INPUT_ONLY_STREAM_NAME,
    });
    const sink = graphBlocks.filter({
        hasText: INPUT_ONLY_SINK_NAME,
    });
    const isolatedStream = graphBlocks.filter({hasText: ISOLATED_STREAM_NAME});

    await expect(graphBlocks).toHaveCount(7, {timeout: 15_000});
    await expect(inputOnlyStream).toHaveCount(1);
    await expect(inputOnlyStream.locator('.g-icon')).toHaveCount(0);
    await expect(isolatedStream).toHaveCount(1);
    await expect(isolatedStream).toBeVisible();
    await expect(isolatedStream.locator('.g-icon')).toHaveCount(0);
    await expect(sink).toHaveCount(1);

    const [inputOnlyStreamBox, sinkBox] = await Promise.all([
        inputOnlyStream.boundingBox(),
        sink.boundingBox(),
    ]);
    if (!inputOnlyStreamBox || !sinkBox) {
        throw new Error('Flow graph blocks must have measurable bounds');
    }

    const overlapWidth = Math.max(
        0,
        Math.min(inputOnlyStreamBox.x + inputOnlyStreamBox.width, sinkBox.x + sinkBox.width) -
            Math.max(inputOnlyStreamBox.x, sinkBox.x),
    );
    const overlapHeight = Math.max(
        0,
        Math.min(inputOnlyStreamBox.y + inputOnlyStreamBox.height, sinkBox.y + sinkBox.height) -
            Math.max(inputOnlyStreamBox.y, sinkBox.y),
    );
    const overlapArea = overlapWidth * overlapHeight;

    expect(
        overlapArea,
        `Expected no overlap, got input-only stream ${JSON.stringify(inputOnlyStreamBox)}, ` +
            `sink ${JSON.stringify(sinkBox)}, overlap area ${overlapArea}px²`,
    ).toBe(0);

    await graph.hover();
    for (let i = 0; i < 5; ++i) {
        await page.mouse.wheel(0, 700);
    }
    await expect(graphBlocks).toHaveCount(0);
    await graph.hover({position: {x: 10, y: 10}});
    await expect(page.locator('.yt-flow-graph__item-popup')).toHaveCount(0);
    await page.waitForTimeout(500);
    await expectScreenshot();
});

test('FlowGraph: schematic anchors', async ({mount, expectScreenshot, page, router}) => {
    await router.use(backpressuredFlowGraphHandler);
    await mount(<FlowGraphStories.Backpressured />);

    const graph = page.locator('.yt-flow-graph__graph');
    await graph.hover();
    await page.mouse.wheel(0, 700);
    await expect(page.locator(`.${anchor}`)).toHaveCount(0);
    await graph.hover({position: {x: 10, y: 10}});
    await expect(page.locator('.yt-flow-graph__item-popup')).toHaveCount(0);
    await page.waitForTimeout(500);

    await expectScreenshot();
});

test('FlowGraph: sources follow the order of their source streams', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(multipleSourcesFlowGraphHandler);
    await mount(<FlowGraphStories.MultipleSources />);

    async function getTopDown(names: Array<string>) {
        const tops = await Promise.all(
            names.map(async (name) => {
                const block = page.locator('.graph-block-wrapper', {
                    has: page.getByText(name, {exact: true}),
                });
                const box = await block.boundingBox();
                if (!box) {
                    throw new Error(`Block "${name}" must have measurable bounds`);
                }
                return {name, y: box.y};
            }),
        );
        return tops.sort((l, r) => l.y - r.y).map(({name}) => name);
    }

    await page.getByText(MULTIPLE_SOURCES[0].sourceName, {exact: true}).waitFor();

    const streamsTopDown = await getTopDown(MULTIPLE_SOURCES.map(({streamName}) => streamName));
    const sourcesTopDown = await getTopDown(MULTIPLE_SOURCES.map(({sourceName}) => sourceName));
    const sourceByStream = Object.fromEntries(
        MULTIPLE_SOURCES.map(({streamName, sourceName}) => [streamName, sourceName]),
    );

    expect(streamsTopDown).toEqual(MULTIPLE_SOURCES.map(({streamName}) => streamName));
    expect(sourcesTopDown).toEqual(streamsTopDown.map((name) => sourceByStream[name]));
    await expectScreenshot();
});

type Box = {x: number; y: number; width: number; height: number};

// The number of separate line segments drawn on the graph canvas between two blocks, left to right:
// a dashed connection between them yields several segments, no connection yields none.
function countSegmentsBetween(page: Page, left: Box, right: Box) {
    return page.evaluate(
        ({leftBox, rightBox}) => {
            const x0 = leftBox.x + leftBox.width;
            const x1 = rightBox.x;
            const y0 = Math.min(leftBox.y, rightBox.y);
            const y1 = Math.max(leftBox.y + leftBox.height, rightBox.y + rightBox.height);
            const columns = new Map<number, boolean>();
            document.querySelectorAll('canvas').forEach((canvas) => {
                const ctx = canvas.getContext('2d');
                const rect = canvas.getBoundingClientRect();
                if (!ctx || !canvas.width || !rect.width) {
                    return;
                }
                const scale = canvas.width / rect.width;
                const sx = Math.max(0, Math.round((x0 - rect.left) * scale) + 2);
                const ex = Math.min(canvas.width, Math.round((x1 - rect.left) * scale) - 2);
                const sy = Math.max(0, Math.round((y0 - rect.top) * scale));
                const ey = Math.min(canvas.height, Math.round((y1 - rect.top) * scale));
                if (ex <= sx || ey <= sy) {
                    return;
                }
                const {data} = ctx.getImageData(sx, sy, ex - sx, ey - sy);
                const width = ex - sx;
                const height = ey - sy;
                // The most frequent color of the region is the background.
                const frequencies = new Map<string, number>();
                for (let i = 0; i < data.length; i += 4) {
                    const color = data.slice(i, i + 4).join(',');
                    frequencies.set(color, (frequencies.get(color) ?? 0) + 1);
                }
                const [backgroundColor] = [...frequencies.entries()].sort(
                    ([, l], [, r]) => r - l,
                )[0];
                const background = backgroundColor.split(',').map(Number);
                const differs = (i: number) =>
                    background.some((value, channel) => Math.abs(value - data[i + channel]) > 40);
                for (let x = 0; x < width; ++x) {
                    let ink = false;
                    for (let y = 0; y < height && !ink; ++y) {
                        ink = differs((y * width + x) * 4);
                    }
                    columns.set(x, Boolean(columns.get(x)) || ink);
                }
            });
            let segments = 0;
            let previous = false;
            for (const [, ink] of [...columns.entries()].sort(([a], [b]) => a - b)) {
                if (ink && !previous) {
                    ++segments;
                }
                previous = ink;
            }
            return segments;
        },
        {leftBox: left, rightBox: right},
    );
}

test('FlowGraph: data-channel edge connects sink and source', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    test.slow();

    await router.use(dataChannelFlowGraphHandler);
    await mount(<FlowGraphStories.DataChannel />);

    await page.getByText('Zoom to:').waitFor();
    const graph = page.locator('.yt-flow-graph__graph');
    await graph.hover();
    await page.waitForTimeout(500);
    await expectScreenshot();

    // The edge stays in the zoomed-out view of computation groups
    for (let i = 0; i < 5; ++i) {
        await page.mouse.wheel(0, 700);
    }
    await graph.hover({position: {x: 10, y: 10}});
    await page.waitForTimeout(500);
    await expectScreenshot({nameSuffix: 'zoomed out'});

    // Close up, the blocks are rendered as elements: a dashed connection lies between the sink and the source
    await graph.hover();
    for (let i = 0; i < 8; ++i) {
        await page.mouse.wheel(0, -700);
    }
    const block = (name: string) =>
        page.locator('.graph-block-wrapper', {has: page.getByText(name, {exact: true})}).first();
    await expect(block('Audit sink')).toBeVisible({timeout: 15_000});
    const sinkBox = await block('Audit sink').boundingBox();
    const sourceBox = await block('Audit source').boundingBox();
    if (!sinkBox || !sourceBox) {
        throw new Error('The sink and the source must have measurable bounds');
    }
    await expect.poll(() => countSegmentsBetween(page, sinkBox, sourceBox)).toBeGreaterThan(2);
});
