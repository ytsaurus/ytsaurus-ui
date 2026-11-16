import {type Page, expect} from '@playwright/test';
import {HasPage} from './BasePage';
import {replaceInnerHtml} from '../utils/dom';

export class Monaco extends HasPage {
    private readonly input = this.page.getByRole('textbox', {name: 'Editor content', exact: true});

    async focus() {
        await this.input.focus();
        await expect(this.input).toBeFocused();
    }

    async type(text: string) {
        await this.input.pressSequentially(text);
    }

    async press(key: string) {
        await this.input.press(key);
    }

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
