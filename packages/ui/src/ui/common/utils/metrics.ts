import {getConfigData} from '../../config/ui-settings';
import YT from '../../config/yt-config';
import {rumLogError} from '../../rum/rum-counter';

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

interface Counter {
    hit(url: string, options: object): void;
    params(params: object): void;
    reachGoal(goal: string, options: object): void;
}

const FAKE_COUNTER: Counter = {hit() {}, params() {}, reachGoal() {}};

function getCounter(id: string | number): Counter | undefined {
    const COUNTER_NAME = 'yaCounter' + id;
    return (window as any)[COUNTER_NAME];
}

function waitForCounter(id?: string | number): Promise<Counter> {
    if (!id) {
        return Promise.resolve(FAKE_COUNTER);
    }

    const res = getCounter(id);
    if (res) {
        return Promise.resolve(res);
    } else {
        const INIT_EVENT_NAME = 'yacounter' + id + 'inited';
        return new Promise((resolve) => {
            const listener = () => {
                document.removeEventListener(INIT_EVENT_NAME, listener);
                resolve(getCounter(id)!);
            };
            document.addEventListener(INIT_EVENT_NAME, listener);
        });
    }
}

class MetrikaCounter {
    private id?: string | number;

    constructor(id?: string | number) {
        this.id = id;
    }

    async countHit(params: object) {
        const url = this.getURL();
        const options = {params: createMetricsHit(params)};
        return this.callImpl('hit', url, options);
    }

    async countEvent(params: object) {
        params = createMetricsEvent(params);
        return this.callImpl('params', params);
    }

    async reachGoal(goal: string, options: object) {
        return this.callImpl('reachGoal', goal, {service: 'yt', ...options});
    }

    private async callImpl<K extends keyof Counter>(method: K, ...args: Parameters<Counter[K]>) {
        const counter = await waitForCounter(this.id);
        try {
            (counter[method] as any)(...args);
        } catch (e) {
            rumLogError(
                {
                    message: `Failed to call metrika.${method} for ${this.id}-counter`,
                    additional: {
                        args,
                    },
                },
                e as Error,
            );
        }
    }

    private getURL() {
        // This solution is used due to encoding bug in firefox, that is currently happenning if location.href is used
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

const metrics = new MetrikaCounter(getConfigData().metrikaCounterId);

export default metrics;
