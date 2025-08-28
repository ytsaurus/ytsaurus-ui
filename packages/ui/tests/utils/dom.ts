import {Page} from '@playwright/test';

type Selector = string;

// eslint-disable-next-line no-implicit-globals
export async function replaceInnerHtml(
    page: Page,
    toReplace: Record<Selector, string | {regex: string; replacement: string}>,
) {
    for (const selector of Object.keys(toReplace)) {
        await page.waitForSelector(selector);
    }

    await page.evaluate((toReplace) => {
        Object.entries(toReplace).forEach(([selector, content]) => {
            document.querySelectorAll(selector).forEach((el) => {
                el.innerHTML =
                    'string' === typeof content
                        ? content
                        : el.innerHTML.replace(new RegExp(content.regex), content.replacement);
            });
        });
    }, toReplace);
}

export const FAKE_DATE = '01 Jan 1970';

export const FAKE_DATE_TIME = '01 Jan 1970 00:00:00';
export async function replaceInnerHtmlForDateTime(page: Page, selectors: Array<string>) {
    replaceInnerHtmlForSimilarElements(page, selectors, FAKE_DATE_TIME);
}

export const FAKE_DATE_TIME_ISO = '1970-01-01T00:00:00.000000Z';
export async function replaceInnerHtmlForIsoDate(page: Page, selectors: Array<string>) {
    replaceInnerHtmlForSimilarElements(page, selectors, FAKE_DATE_TIME_ISO);
}

export const FAKE_DURATION = 'XX:XX:XX';
export async function replaceInnerHtmlForDuration(page: Page, selectors: Array<string>) {
    replaceInnerHtmlForSimilarElements(page, selectors, FAKE_DURATION);
}

export const FAKE_ID = '00000000-11111111-22222222-33333333';
export async function replaceInnerHtmlForId(page: Page, selectors: Array<string>) {
    replaceInnerHtmlForSimilarElements(page, selectors, FAKE_ID);
}

export async function replaceInnerHtmlProgress(page: Page) {
    replaceInnerHtmlForSimilarElements(
        page,
        ['.g-progress .g-progress__text', '.g-progress__text-inner'],
        '0 / 00.00 XxX',
    );
}

export async function replaceInnerHtmlForSimilarElements(
    page: Page,
    selectors: Array<string>,
    replacement: string,
) {
    await replaceInnerHtml(
        page,
        selectors?.reduce(
            (acc, selector) => {
                acc[selector] = replacement;
                return acc;
            },
            {} as Record<string, string>,
        ),
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

export async function setDisplayNone(page: Page, selectors: Array<string>) {
    type StylesType = Parameters<typeof setStyle>[1];
    const styles = selectors.reduce((acc, s) => {
        acc[s] = {display: 'none'};
        return acc;
    }, {} as StylesType);
    await setStyle(page, styles);
}
