import {Page} from '@playwright/test';

type Selector = string;

// eslint-disable-next-line no-implicit-globals
export async function replaceInnerHtml(page: Page, toReplace: Record<Selector, string>) {
    for (const selector of Object.keys(toReplace)) {
        await page.waitForSelector(selector);
    }

    await page.evaluate((toReplace) => {
        Object.entries(toReplace).forEach(([selector, content]) => {
            document.querySelectorAll(selector).forEach((el, index) => {
                console.log({index, el});
                el.innerHTML = content;
            });
        });
    }, toReplace);
}

export async function replaceInnerHtmlForDateTime(page: Page, selectors: Array<string>) {
    const defaultDateTime = '01 Jan 1970 00:00:00';
    await replaceInnerHtml(
        page,
        selectors?.reduce((acc, selector) => {
            acc[selector] = defaultDateTime;
            return acc;
        }, {} as Record<string, string>),
    );
}

async function setStyle(
    page: Page,
    styles: Record<string, Omit<Partial<CSSStyleDeclaration>, 'length' | 'parentRule'>>,
) {
    for (const s of Object.keys(styles)) {
        await page.waitForSelector(s);
    }

    await page.evaluate((styles) => {
        Object.entries(styles).forEach(([s, extraStyles]) => {
            document.querySelectorAll(s).forEach((e) => {
                const style = (e as HTMLElement).style ?? {};
                Object.entries(extraStyles).forEach(([k, value]) => {
                    const key = k as keyof typeof extraStyles;
                    style[key] = value as any;
                });
            });
        });
    }, styles);
}

export async function setVisibilityHidden(
    page: Page,
    selectors: Array<string>,
    {monospace}: {monospace?: boolean} = {},
) {
    type StylesType = Parameters<typeof setStyle>[1];
    const styles = selectors.reduce((acc, s) => {
        acc[s] = {visibility: 'hidden'};
        if (monospace) {
            acc[s].fontFamily = 'monospace';
        }
        return acc;
    }, {} as StylesType);
    await setStyle(page, styles);
}
