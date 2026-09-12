import {expect, test} from '../../../../../playwright-components/core';

import {
    Backpressured,
    Drained,
    DrainedAndBackpressured,
    MessagesOnly,
    WithoutDetails,
} from '../__stories__/FlowGraph.stories';
import {
    MESSAGE_TEXT,
    SOURCE_NAME,
    backpressuredFlowGraphHandler,
    drainedFlowGraphHandler,
    emptyFlowGraphHandler,
    messagesFlowGraphHandler,
    mixedFlowGraphHandler,
} from '../__stories__/mocks';

const anchor = 'yt-flow-graph-anchors__computation-anchor';
const summary = 'yt-flow-graph-anchors__summary-inner';

test('FlowGraph: drained anchor', async ({mount, expectScreenshot, page, router}) => {
    await router.use(drainedFlowGraphHandler);
    await mount(Drained.render?.());

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
    await mount(Drained.render?.());

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
    await mount(Backpressured.render?.());

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
    await mount(DrainedAndBackpressured.render?.());

    await expect(page.locator(`.${anchor}`)).toHaveCount(1);
    await expect(page.locator(`.${summary}_drained.${summary}_backpressured`)).toHaveCount(1);
    await expect(page.locator(`.${anchor} .g-icon`)).toHaveCount(1);
    await expectScreenshot();
});

test('FlowGraph: messages-only anchor', async ({mount, expectScreenshot, page, router}) => {
    await router.use(messagesFlowGraphHandler);
    await mount(MessagesOnly.render?.());

    const messagesAnchor = page.locator(
        `.${summary}:not(.${summary}_drained):not(.${summary}_backpressured)`,
    );
    await expect(messagesAnchor).toHaveCount(1);
    await expect(messagesAnchor.locator('.g-icon')).toHaveCount(1);
    await expectScreenshot();
});

test('FlowGraph: messages dialog', async ({mount, expectScreenshot, page, router}) => {
    await router.use(messagesFlowGraphHandler);
    await mount(MessagesOnly.render?.());

    const messagesAnchor = page.locator(
        `.${summary}:not(.${summary}_drained):not(.${summary}_backpressured)`,
    );
    await messagesAnchor.click();
    await expect(page.getByText(MESSAGE_TEXT, {exact: true})).toBeVisible();
    await expectScreenshot();
});

test('FlowGraph: anchor without details is hidden', async ({mount, page, router}) => {
    await router.use(emptyFlowGraphHandler);
    await mount(WithoutDetails.render?.());

    await page.getByText(SOURCE_NAME, {exact: true}).waitFor();
    await expect(page.locator(`.${anchor}`)).toHaveCount(0);
});

test('FlowGraph: schematic anchors', async ({mount, expectScreenshot, page, router}) => {
    await router.use(backpressuredFlowGraphHandler);
    await mount(Backpressured.render?.());

    const graph = page.locator('.yt-flow-graph__graph');
    await graph.hover();
    await page.mouse.wheel(0, 700);
    await expect(page.locator(`.${anchor}`)).toHaveCount(0);
    await graph.hover({position: {x: 10, y: 10}});
    await expect(page.locator('.yt-flow-graph__item-popup')).toHaveCount(0);
    await page.waitForTimeout(500);

    await expectScreenshot();
});
