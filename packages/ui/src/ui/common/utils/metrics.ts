import UIFactory from '../../UIFactory';
import {YT} from '../../config/yt-config';
import {rumLogError} from '../../rum/rum-counter';
import {getConfigData} from '../../config/ui-settings';

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

export interface AnalyticsService {
    countHit(params: object): Promise<void>;
    countEvent(event: string, params: object | string | number): Promise<void>;
    reachGoal(goal: string, options: object): Promise<void>;
}

interface Counter {
    hit(url: string, options: object): void;
    params(params: object): void;
    reachGoal(goal: string, options: object): void;
}

const FAKE_COUNTER: Counter = {hit() {}, params() {}, reachGoal() {}};

class YandexMetrika implements AnalyticsService {
    private readonly id?: string | number;

    constructor(id?: string | number) {
        this.id = id;
    }

    async countHit(params: object) {
        const url = this.getURL();
        const options = {params: createMetricsHit(params)};
        return this.callImpl('hit', url, options);
    }

    async countEvent(event: string, params: object | number | string) {
        return this.callImpl('params', createMetricsEvent({[event]: params}));
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

class MultiAnalytics implements AnalyticsService {
    private services: AnalyticsService[];

    constructor(services: AnalyticsService[]) {
        this.services = services;
    }

    async countHit(params: object) {
        await Promise.all(
            this.services.map((service) =>
                service.countHit(params).catch((e) => {
                    rumLogError(
                        {
                            message: 'Failed to count hit in analytics service',
                            additional: {params},
                        },
                        e as Error,
                    );
                }),
            ),
        );
    }

    async countEvent(event: string, params: object) {
        await Promise.all(
            this.services.map((service) =>
                service.countEvent(event, params).catch((e) => {
                    rumLogError(
                        {
                            message: 'Failed to count event in analytics service',
                            additional: {params},
                        },
                        e as Error,
                    );
                }),
            ),
        );
    }

    async reachGoal(goal: string, options: object) {
        await Promise.all(
            this.services.map((service) =>
                service.reachGoal(goal, options).catch((e) => {
                    rumLogError(
                        {
                            message: 'Failed to reach goal in analytics service',
                            additional: {goal, options},
                        },
                        e as Error,
                    );
                }),
            ),
        );
    }
}

class AnalyticsFactory {
    static createAnalytics(): AnalyticsService {
        const config = getConfigData();
        const additionalServices = UIFactory.getAnalyticsService(config);
        const services = ([] as AnalyticsService[]).concat(additionalServices);

        if (config.metrikaCounterId) {
            services.push(new YandexMetrika(config.metrikaCounterId));
        }

        return new MultiAnalytics(services);
    }
}

const metrics = AnalyticsFactory.createAnalytics();

export default metrics;
