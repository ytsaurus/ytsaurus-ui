import {Page} from '@playwright/test';
import {HasPage} from './BasePage';

export class Prometheus extends HasPage {
    async waitForChart() {
        await this.page.waitForSelector(
            '.yt-prometheus-dashkit .yt-prometheus-timeseries .yagr-legend',
        );
    }

    async waitForError403() {
        await this.page.waitForSelector(
            '.yt-prometheus-dashkit .yt-prometheus-timeseries .yt-error-inline:text("Request failed with status code 403")',
        );
    }
}

export function prometheus(page: Page) {
    return new Prometheus(page);
}
