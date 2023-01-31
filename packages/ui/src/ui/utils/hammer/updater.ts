import {getUseAutoRefresh} from '../../store/selectors/settings';
import {getWindowStore} from '../../store/window-store';

export default class Updater {
    private _updaters: Record<string, null | number> = {};

    remove(id: string) {
        this._removeTimer(id);
        delete this._updaters[id];
    }

    add(id: string, updater: () => void, time: number, settings: {skipInitialCall?: boolean} = {}) {
        const {skipInitialCall} = settings;

        if (this._updaters[id]) {
            this.remove(id);
        }

        this._addTimer(id, updater, time, skipInitialCall);
    }

    private _repeat(id: string, callback: () => void, time: number) {
        const useAutoRefresh = getUseAutoRefresh(getWindowStore().getState());

        const finallyHandler = () => {
            if (this._updaters[id] || this._updaters[id] === null) {
                this._updaters[id] = window.setTimeout(
                    () => this._repeat(id, callback, time),
                    time,
                );
            }
        };

        const doRequest = useAutoRefresh || this._updaters[id] === null;

        /* eslint-disable callback-return */
        Promise.resolve(doRequest ? callback() : null)
            .then(finallyHandler)
            .catch(finallyHandler);
        /* eslint-enable callback-return */
    }

    private _addTimer(id: string, callback: () => void, time: number, skipInitialCall?: boolean) {
        this._updaters[id] = null;

        if (!skipInitialCall) {
            this._repeat(id, callback, time);
        } else {
            this._updaters[id] = window.setTimeout(() => this._repeat(id, callback, time), time);
        }
    }

    private _removeTimer(id: string) {
        window.clearTimeout(this._updaters[id]!);
    }
}
