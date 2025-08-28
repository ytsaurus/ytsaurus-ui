import {Page} from '@playwright/test';
import {HasPage} from './BasePage';
import {replaceInnerHtml} from '../utils/dom';

export class Monaco extends HasPage {
    async replace({line, regex, replacement}: {line?: number; regex: string; replacement: string}) {
        let selector = `.yt-monaco-editor .view-lines .view-line`;
        if (line && line > 0) {
            selector += `:nth(${line})`;
        }
        await replaceInnerHtml(this.page, {[selector]: {regex, replacement}});
    }
}

export function monaco(page: Page) {
    return new Monaco(page);
}
