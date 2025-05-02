import {AnalyticsService} from './metrics';
import {YT} from '../../config/yt-config';

interface Counter {
    hit(url: string, options: object): void;
    params(params: object): void;
    reachGoal(goal: string, options: object): void;
}

function createMetricsHit(params: object) {
    return wrapWithEnv({
        yt_hit: params,
    });
}

function createMetricsEvent(params: object) {
    return wrapWithEnv({
        yt_event: params,
    });
}

function wrapWithEnv(params: object) {
    if (YT.environment !== 'development' && YT.environment !== 'localmode') {
        return params;
    }

    return {[YT.environment]: params};
}

const FAKE_COUNTER: Counter = {hit() {}, params() {}, reachGoal() {}};

export class YandexMetrika implements AnalyticsService {
    private readonly id?: string | number;

    constructor(id?: string | number) {
        this.id = id;
    }

    async countHit(params: object) {
        const url = this.getURL();
        const options = {params: createMetricsHit(params)};
        return this.callImpl('hit', url, options);
    }

    async countEvent(event: string, params?: object | number | string) {
        return this.callImpl('params', createMetricsEvent({[event]: params ?? 1}));
    }

    async reachGoal(goal: string, options: object) {
        return this.callImpl('reachGoal', goal, {service: 'yt', ...options});
    }

    private getCounter(id: string | number): Counter | undefined {
        const COUNTER_NAME = 'yaCounter' + id;
        return (window as any)[COUNTER_NAME];
    }

    private async waitForCounter(id?: string | number): Promise<Counter> {
        if (!id) {
            return Promise.resolve(FAKE_COUNTER);
        }

        const res = this.getCounter(id);

        if (res) {
            return Promise.resolve(res);
        } else {
            const INIT_EVENT_NAME = 'yacounter' + id + 'inited';
            return new Promise((resolve) => {
                const listener = () => {
                    document.removeEventListener(INIT_EVENT_NAME, listener);
                    resolve(this.getCounter(id)!);
                };
                document.addEventListener(INIT_EVENT_NAME, listener);
            });
        }
    }

    private async callImpl<K extends keyof Counter>(method: K, ...args: Parameters<Counter[K]>) {
        const counter = await this.waitForCounter(this.id);

        (counter[method] as any)(...args);
    }

    private getURL() {
        return (
            location.protocol +
            '//' +
            location.host +
            location.pathname +
            location.search +
            location.hash
        );
    }
}
