import React, {createContext, useState, useContext} from 'react';
import {
    rumDebugLog,
    rumFinalizeSpa,
    rumGetTime,
    rumMakeSubPage,
    rumSendDelta,
    SubPage,
} from './rum-counter';

interface RumUiEvent {
    type: string;
    start: number;
    page?: SubPage;
    additionalStartType?: string;
}

interface EventsContainer {
    [type: string]: RumUiEvent;
}

export interface RumUiContextValue {
    _events: EventsContainer; // only for debug purposes do not modify it from outside
    /**
     * When additionalStartType is passed then start time will be calculated as
     * Min(start_of_type, start_of_additionalStartType), the property might
     * be useful when stop of some measure should be initiated by some embedded component
     * @param params
     */
    startRumMeasure(params: {
        type: string;
        override?: boolean;
        additionalStartType?: string;
        subPage?: string;
    }): void;

    /**
     * Usually you do not need to pass subType parameter, but in some cases
     * subType might be useful especially if some component have some property
     * which affects the way of the component's rendering
     */
    stopRumMeasure(params: {type: string; subType?: string}): void;
    clearRumMeasure(type: string): void;
    setSubpage(page: string): void;
}

const RumUiContext = createContext<RumUiContextValue | null>(null);

export function useRumUi(): RumUiContextValue {
    const ctx = useContext(RumUiContext);
    if (!ctx) {
        throw new Error('RumUiProvider was not found');
    }
    return ctx;
}

export interface UseRumMeasureProps<T extends Array<any>> {
    type: string;
    subType?: string;

    stopDeps: T;
    /**
     * Usually stopDesp contains flags of loading state, the function is required to skip incorrect values,
     * for example we should stop measure only when loadState === 'loaded'.
     * Either we should skip some unitialized values for first render.
     * @param stopDeps
     */
    allowStop?: (stopDeps: T) => boolean;
}

export function useRumMeasureStop<T extends Array<any>>(props: UseRumMeasureProps<T>) {
    const {type, subType, stopDeps, allowStop} = props;
    const {stopRumMeasure, clearRumMeasure} = useRumUi();

    React.useEffect(() => {
        if (!allowStop || allowStop(stopDeps)) {
            //console.log(type, Date.now(), 'stop', stopDeps);
            stopRumMeasure({type, subType});
        }
    }, stopDeps);

    // Without this clear result of a started measure might be erroneously too big
    React.useEffect(() => {
        return () => {
            clearRumMeasure(type);
        };
    }, []);
}

export interface RumMeasureStartProps<T extends Array<any>> {
    type: string;
    additionalStartType?: string;
    startDeps: T;
    allowStart?: (startDeps: T) => boolean;
    skipOnMountStart?: boolean;
    subPage?: string;
}

export function useRumMeasureStart<T extends Array<any>>(props: RumMeasureStartProps<T>) {
    const {type, startDeps, allowStart, skipOnMountStart, additionalStartType, subPage} = props;
    const {startRumMeasure, clearRumMeasure} = useRumUi();

    React.useMemo(() => {
        if (!allowStart || allowStart(startDeps)) {
            startRumMeasure({
                type,
                override: false,
                additionalStartType,
                subPage,
            });
        }
    }, startDeps);

    React.useMemo(() => {
        // componentDidMount
        if (!skipOnMountStart) {
            startRumMeasure({
                type,
                override: false,
                additionalStartType,
                subPage,
            });
        }
    }, []);

    // componentDidUnmount
    React.useEffect(() => {
        return () => {
            clearRumMeasure(type);
        };
    }, []);
}

interface IRumUiProviderProps {
    children: React.ReactNode;
    page?: string;
}

export function RumUiProvider({children, page}: IRumUiProviderProps) {
    const [contextValue] = useState(() => createRumContext(page));
    return <RumUiContext.Provider value={contextValue}>{children}</RumUiContext.Provider>;
}

function createRumEvent(type: string, page?: SubPage): RumUiEvent {
    return {
        type,
        start: rumGetTime(),
        page,
    };
}

function createRumContext(page?: string): RumUiContextValue {
    let curPage: SubPage | undefined = page ? rumMakeSubPage(page) : undefined;

    const _events: {[type: string]: RumUiEvent} = {};

    return {
        _events,
        startRumMeasure(params: {
            type: string;
            override?: boolean;
            additionalStartType?: string;
            subPage?: string;
        }) {
            const {type, override, additionalStartType, subPage} = params;
            if (override || !_events[type]) {
                rumDebugLog('CTX_START_MEASURE++', type);
                const startSubPage = subPage ? rumMakeSubPage(subPage) : undefined;
                const event = (_events[type] = createRumEvent(type, startSubPage || curPage));
                const additionalEvent = additionalStartType
                    ? _events[additionalStartType]
                    : undefined;
                if (additionalEvent && !override) {
                    const {start: additionalStart} = additionalEvent;
                    const {start} = event;
                    event.start = Math.min(start, additionalStart);
                    event.additionalStartType = additionalStartType;
                }
            }
        },
        stopRumMeasure(params: {type: string; subType?: string}) {
            const {type, subType = ''} = params;
            const time = rumGetTime();
            const event = _events[type];
            if (event) {
                // eslint-disable-next-line no-shadow
                const {start, type, page, additionalStartType} = event;
                delete _events[type];

                if (subType) {
                    const withSubType = `${type}.${subType}`;
                    rumDebugLog('CTX_STOP__MEASURE--', withSubType, time - start, _events);
                    rumSendDelta('ui.' + withSubType, time - start, page);
                }
                rumDebugLog('CTX_STOP__MEASURE--', type, time - start, _events);
                rumSendDelta('ui.' + type, time - start, page);

                const addEvent = additionalStartType ? _events[additionalStartType] : undefined;
                if (addEvent) {
                    const {start, type, page} = addEvent;
                    delete _events[type];
                    rumDebugLog('CTX_STOP__MEASURE--', type, time - start, _events);
                    rumSendDelta('ui.' + type, time - start, page);
                }

                rumFinalizeSpa();
            }
        },
        clearRumMeasure(type: string) {
            if (_events[type]) {
                rumDebugLog('CTX_CLEAR_MEASURE##', type);
                delete _events[type];
            }
        },
        setSubpage(newPage: string) {
            rumDebugLog('Set subpage', newPage);
            curPage = rumMakeSubPage(newPage);
        },
    };
}
