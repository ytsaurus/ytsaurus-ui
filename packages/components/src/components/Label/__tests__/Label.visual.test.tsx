import {test} from '../../../playwright-components/core';

import {Label} from '../Label';
import {LabelOnOff} from '../LabelOnOff';

test('Label: Default', async ({mount, expectScreenshot}) => {
    await mount(
        <Label
            text="Label text"
            theme="default"
            type="block"
            capitalize={false}
            hideTitle={false}
        />,
    );
    await expectScreenshot();
});

test('Label: Success', async ({mount, expectScreenshot}) => {
    await mount(
        <Label
            text="Label text"
            theme="success"
            type="block"
            capitalize={false}
            hideTitle={false}
        />,
    );
    await expectScreenshot();
});

test('Label: Warning', async ({mount, expectScreenshot}) => {
    await mount(
        <Label
            text="Label text"
            theme="warning"
            type="block"
            capitalize={false}
            hideTitle={false}
        />,
    );
    await expectScreenshot();
});

test('Label: Danger', async ({mount, expectScreenshot}) => {
    await mount(
        <Label
            text="Label text"
            theme="danger"
            type="block"
            capitalize={false}
            hideTitle={false}
        />,
    );
    await expectScreenshot();
});

test('Label: Error', async ({mount, expectScreenshot}) => {
    await mount(
        <Label text="Label text" theme="error" type="block" capitalize={false} hideTitle={false} />,
    );
    await expectScreenshot();
});

test('Label: Info', async ({mount, expectScreenshot}) => {
    await mount(
        <Label text="Label text" theme="info" type="block" capitalize={false} hideTitle={false} />,
    );
    await expectScreenshot();
});

test('Label: Complementary', async ({mount, expectScreenshot}) => {
    await mount(
        <Label
            text="Label text"
            theme="complementary"
            type="block"
            capitalize={false}
            hideTitle={false}
        />,
    );
    await expectScreenshot();
});

test('Label: Misc', async ({mount, expectScreenshot}) => {
    await mount(
        <Label text="Label text" theme="misc" type="block" capitalize={false} hideTitle={false} />,
    );
    await expectScreenshot();
});

test('LabelOnOff: On', async ({mount, expectScreenshot}) => {
    await mount(<LabelOnOff value />);
    await expectScreenshot();
});

test('LabelOnOff: Off', async ({mount, expectScreenshot}) => {
    await mount(<LabelOnOff value={false} />);
    await expectScreenshot();
});

test('LabelOnOff: NoValue', async ({mount, expectScreenshot}) => {
    await mount(<LabelOnOff />);
    await expectScreenshot();
});
