import {isEqual, omit} from 'lodash';
import {QueryItem} from '../../module/api';

type QueryChangeHandler = (value: QueryItem[]) => void;
type QueryListRequest = (ids: string[]) => Promise<QueryItem[]>;

export class QueriesPollingService {
    protected intervaTime = 1000;

    protected watchedQueries = new Set<QueryItem['id']>();

    protected initialValues = new Map<QueryChangeHandler, Record<QueryItem['id'], QueryItem>>();

    protected handlersValues = new Map<QueryItem['id'], QueryChangeHandler[]>();

    protected groupHandlers = new WeakSet<QueryChangeHandler>();

    protected intervalKey?: number;

    protected loading = false;

    protected requestQueryList: QueryListRequest;

    constructor(requestQueryList: QueryListRequest) {
        this.requestQueryList = requestQueryList;
    }

    watch(query: QueryItem[], onChange: QueryChangeHandler) {
        const ubsubscribes = query.map((q) => this.subscribe(q.id, onChange, q));
        return () => {
            ubsubscribes.forEach((ubsubscribe) => ubsubscribe());
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
        const items = Array.from(this.watchedQueries);
        if (!items?.length) {
            this.intervalKey = undefined;
            return;
        }
        this.loading = true;
        try {
            const result = await this.requestQueryList(items);

            // Collect data for handlers;
            const handlersMap = result?.reduce((acc, item) => {
                const handlers = this.handlersValues.get(item.id);
                if (handlers?.length) {
                    handlers.forEach((handler) => {
                        const list = acc.get(handler) || [];
                        list.push(item);
                        acc.set(handler, list);
                    });
                }
                return acc;
            }, new Map<QueryChangeHandler, QueryItem[]>());

            handlersMap.forEach((items, handler) => {
                const valuesMap = this.initialValues.get(handler);
                if (valuesMap) {
                    const realItems = items.filter((item) => {
                        return !valuesMap[item.id] || !isEqual(valuesMap[item.id], item);
                    });
                    if (realItems.length) {
                        handler(realItems);
                    }
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

    protected subscribe(
        queryId: QueryItem['id'],
        onUpdate: QueryChangeHandler,
        initialValue?: QueryItem,
    ) {
        this.watchedQueries.add(queryId);
        const handlers = this.handlersValues.get(queryId) || [];
        handlers.push(onUpdate);
        this.handlersValues.set(queryId, handlers);
        if (initialValue) {
            const values = this.initialValues.get(onUpdate) || {};
            values[initialValue.id] = initialValue;
            this.initialValues.set(onUpdate, values);
        }
        this.start();
        return () => {
            this.ubsubscribe(queryId, onUpdate);
        };
    }

    protected ubsubscribe(queryId: QueryItem['id'], handler: QueryChangeHandler) {
        this.watchedQueries.delete(queryId);
        this.removeHandler(queryId, handler);
        this.removeInitialValue(queryId, handler);
        if (this.watchedQueries.size === 0) {
            this.stop();
        }
    }

    private removeInitialValue(queryId: QueryItem['id'], handler: QueryChangeHandler) {
        const values = this.initialValues.get(handler);
        const next = omit(values, queryId);
        if (Object.keys(next).length) {
            this.initialValues.set(handler, next);
        } else {
            this.initialValues.delete(handler);
        }
    }

    private removeHandler(queryId: QueryItem['id'], handler: QueryChangeHandler) {
        const handlers = this.handlersValues.get(queryId);
        if (handlers && handlers.length > 1) {
            this.handlersValues.set(
                queryId,
                handlers.filter((h) => h !== handler),
            );
        } else {
            this.handlersValues.delete(queryId);
        }
    }
}
