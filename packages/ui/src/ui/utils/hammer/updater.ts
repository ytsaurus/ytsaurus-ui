export type UpdaterOptions = {
    getSkipNextCall: () => boolean;
};

export class Updater {
    private callback?: () => unknown;
    private timeout: number;
    private options?: UpdaterOptions;

    private inProgress = false;
    private lastCallTime = 0;
    private frozen = false;
    private timerId?: number;

    constructor(callback: () => unknown, timeout: number, dynamicOptions?: UpdaterOptions) {
        this.callback = callback;
        this.timeout = Math.max(3000, timeout);
        this.options = dynamicOptions;

        this.repeat();
    }

    destroy() {
        window.clearTimeout(this.timerId);
        delete this.callback;
        delete this.options;
    }

    freeze = () => {
        this.frozen = true;
    };

    unfreeze = () => {
        this.frozen = false;
        if (!this.inProgress && Date.now() - this.lastCallTime >= this.timeout) {
            this.repeat();
        }
    };

    private repeat = async () => {
        window.clearTimeout(this.timerId);

        if (this.frozen) {
            return;
        }

        try {
            this.inProgress = true;
            if (this.lastCallTime === 0 || !this.options?.getSkipNextCall()) {
                await this.callback?.();
            }
        } finally {
            this.inProgress = false;
            this.lastCallTime = Date.now();
            this.timerId = window.setTimeout(this.repeat, this.timeout);
        }
    };
}
