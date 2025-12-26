import reduce_ from 'lodash/reduce';

export class Logger {
    private readonly name: string;
    private readonly startTime: number;

    private props: Record<string, any> = {};

    private lastTime: number;

    constructor(name: string, ...args: Array<any>) {
        this.startTime = Date.now();
        this.lastTime = this.startTime;

        this.name = name;

        this.warn(
            'Loger initialized. Do not forget to remove all the logging before creating a commit!',
            ...args,
        );

        this.log('Start time', this.startTime);
    }

    warn<Args extends Array<any>>(...args: Args) {
        const now = Date.now();
        // eslint-disable-next-line no-console
        console.warn(this.name, now - this.startTime, now - this.lastTime, ...args);
        this.lastTime = now;
    }

    log<Args extends Array<any>>(...args: Args) {
        const now = Date.now();
        // eslint-disable-next-line no-console
        console.log(this.name, now - this.startTime, now - this.lastTime, ...args);
        this.lastTime = now;
    }

    diff(name: string, props: any = {}) {
        const prev = this.props[name];

        let diff = {};
        if (prev !== props) {
            if (prev === undefined) {
                diff = props;
            } else if (props === undefined) {
                diff = prev;
            } else {
                const keys = new Set([...Object.keys(prev || {}), ...Object.keys(props || {})]);
                diff = reduce_(
                    [...keys],
                    (acc, k) => {
                        if (prev[k] !== props[k]) {
                            acc[k] = [prev[k], props[k]];
                        }
                        return acc;
                    },
                    {} as any,
                );
            }
        }

        this.props[name] = props;

        this.log(name + ' diff:', diff);
    }
}

const logger = new Logger('UI_LOGGER');

export default logger;
