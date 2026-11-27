import axios, {AxiosError, type CancelTokenSource} from 'axios';

export default class CancelHelper {
    private tokens: Array<CancelTokenSource> = [];

    removeAllAndSave = (token: CancelTokenSource) => {
        this.removeAllRequests();
        this.saveCancelToken(token);
    };

    saveCancelToken = (token: CancelTokenSource) => {
        this.tokens.push(token);
    };

    removeAllRequests = () => {
        while (this.tokens.length) {
            this.tokens.pop()?.cancel();
        }
    };

    removeAllAndGenerateNextToken() {
        this.removeAllRequests();
        return this.generateNextToken();
    }

    wrap<T>(promise: Promise<T>): Promise<T> {
        const cancelToken = this.generateNextToken();

        return promise.finally(() => {
            cancelToken.throwIfRequested();
        });
    }

    generateNextToken() {
        const source = axios.CancelToken.source();
        this.saveCancelToken(source);
        return source.token;
    }
}

export function isCancelled(e: any) {
    return axios.isCancel(e) || e.code === 'cancelled' || e.code === AxiosError.ERR_CANCELED;
}
