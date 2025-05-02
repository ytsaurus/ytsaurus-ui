import UIFactory from '../../UIFactory';
import {rumLogError} from '../../rum/rum-counter';
import {getConfigData} from '../../config/ui-settings';
import {YandexMetrika} from './YandexMetrika';

type MetricCountEventParams = object | string | number;

export interface AnalyticsService {
    countHit(params: object): Promise<void>;
    countEvent(event: string, params?: MetricCountEventParams): Promise<void>;
    reachGoal(goal: string, options: object): Promise<void>;
}

class MultiAnalytics implements AnalyticsService {
    private services: AnalyticsService[];

    constructor(services: AnalyticsService[]) {
        this.services = services;
    }

    async countHit(params: object) {
        await this.callImpl('countHit', params);
    }

    async countEvent(event: string, params?: MetricCountEventParams) {
        await this.callImpl('countEvent', event, params);
    }

    async reachGoal(goal: string, options: object) {
        await this.callImpl('reachGoal', goal, options);
    }

    private async callImpl<K extends keyof AnalyticsService>(
        method: K,
        ...args: Parameters<AnalyticsService[K]>
    ) {
        await Promise.all(
            this.services.map((service, idx) =>
                (service[method] as any)(...args).catch((e: Error) => {
                    rumLogError(
                        {
                            message: `Failed to call ${method} in analytics service ${idx}`,
                            additional: {args},
                        },
                        e as Error,
                    );
                }),
            ),
        );
    }
}

const createAnalytics = () => {
    const config = getConfigData();
    const additionalServices = UIFactory.getAnalyticsService?.() ?? [];
    const services = ([] as AnalyticsService[]).concat(additionalServices);

    if (config.metrikaCounterId) {
        services.push(new YandexMetrika(config.metrikaCounterId));
    }

    return new MultiAnalytics(services);
};

let analytics: AnalyticsService | null = null;

export function getMetrics(): AnalyticsService {
    if (!analytics) {
        analytics = createAnalytics();
    }

    return analytics;
}
