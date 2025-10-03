import {QueryItem} from '../../../../types/query-tracker/api';
import {isQueryProgress} from '../../utils/query';

type QueryChangeHandler = (value: QueryItem[]) => void;
type QueryListRequest = (ids: string[]) => Promise<QueryItem[]>;

export class QueriesPollingService {
    protected intervaTime = 1000;

    protected watchedQueries = new Map<QueryItem['id'], Set<QueryChangeHandler>>();

    protected intervalKey?: number;

    protected loading = false;

    protected requestQueryList: QueryListRequest;

    constructor(requestQueryList: QueryListRequest) {
        this.requestQueryList = requestQueryList;
    }

    watch(queries: QueryItem[], onChange: QueryChangeHandler) {
        const cleanupHandlers = queries.map((q) => {
            if (!this.watchedQueries.has(q.id)) {
                this.subscribe(q.id, onChange);
            } else {
                const handlerSet = this.watchedQueries.get(q.id);
                handlerSet?.add(onChange);
            }
            return () => this.removeHandler(q.id, onChange);
        });
        return () => {
            cleanupHandlers.forEach((h) => h());
        };
    }

    protected start() {
        if (this.intervalKey || this.loading) {
            return;
        }
        this.intervalKey = Number(setTimeout(this.run, this.intervaTime));
    }

    protected stop() {
        clearTimeout(this.intervalKey);
        this.intervalKey = undefined;
    }

    protected run = async () => {
        const watchedIds = Array.from(this.watchedQueries.keys());
        if (!watchedIds?.length) {
            this.intervalKey = undefined;
            return;
        }
        this.loading = true;
        try {
            const result = await this.requestQueryList(watchedIds);
            result?.forEach((query) => {
                const handlerSet = this.watchedQueries.get(query.id);
                handlerSet?.forEach((handler) => handler([query]));
                if (!isQueryProgress(query)) {
                    this.unsubscribe(query.id);
                }
            });
        } catch (e) {
            console.error(e);
        } finally {
            this.loading = false;
            this.intervalKey = undefined;
            this.start();
        }
    };

    protected subscribe(queryId: QueryItem['id'], onUpdate: QueryChangeHandler) {
        this.watchedQueries.set(queryId, new Set([onUpdate]));
        this.start();
    }

    protected unsubscribe(queryId: QueryItem['id']) {
        this.watchedQueries.delete(queryId);
        if (this.watchedQueries.size === 0) {
            this.stop();
        }
    }

    protected removeHandler(queryId: QueryItem['id'], handler: QueryChangeHandler) {
        const handlerSet = this.watchedQueries.get(queryId);
        if (handlerSet) {
            handlerSet.delete(handler);
        }
    }
}
