import * as React from 'react';

import {useThemeValue} from '@gravity-ui/uikit';
import isEqual_ from 'lodash/isEqual';
import {getCSSPropertyValue, getHEXColor} from './styles';

export type GraphColors = ReturnType<typeof getGraphColors>;
const GraphColorsContext = React.createContext<GraphColors | undefined>(undefined);

interface GraphColorsProviderProps {
    children: React.ReactNode;
    container?: HTMLElement | null;
}

export function GraphColorsProvider({children, container}: GraphColorsProviderProps) {
    const theme = useThemeValue();
    const [colors, setColors] = React.useState(() => getGraphColors(container));
    React.useEffect(() => {
        setColors((prevColors) => {
            const newColors = getGraphColors(container);
            if (isEqual_(prevColors, newColors)) {
                return prevColors;
            }
            return newColors;
        });
    }, [theme, container]);

    return <GraphColorsContext.Provider value={colors}>{children}</GraphColorsContext.Provider>;
}

export function getGraphColors(container?: HTMLElement | null) {
    const getColor = (name: string) => {
        return getHEXColor(
            getCSSPropertyValue(`--yql-graph-color-${name}`, container ?? undefined),
        );
    };
    return {
        operation: {
            new: getColor('operation-new'),
            newBorder: getColor('operation-new-border'),
            newBackground: getColor('operation-new-background'),
            pending: getColor('operation-pending'),
            completed: getColor('operation-completed'),
            completedBorder: getColor('operation-completed-border'),
            completedBackground: getColor('operation-completed-background'),
            aborted: getColor('operation-aborted'),
            abortedBorder: getColor('operation-aborted-border'),
            abortedBackground: getColor('operation-aborted-background'),
            failed: getColor('operation-failed'),
            failedBorder: getColor('operation-failed-border'),
            failedBackground: getColor('operation-failed-background'),
            running: getColor('operation-running'),
            runningBorder: getColor('operation-running-border'),
            runningBackground: getColor('operation-running-background'),
            started: getColor('operation-started'),
            startedBorder: getColor('operation-started-border'),
            startedBackground: getColor('operation-started-background'),
        },
        table: {
            fill1: getColor('table-fill1'),
            fill2: getColor('table-fill2'),
        },
        edge: {
            color: getColor('edge'),
            highlight: getColor('edge-highlight'),
        },
        text: {
            label: getColor('text-label'),
            link: getColor('text-link'),
            operationCount: getColor('text-operation-count'),
        },
    } as const;
}

export function useGraphColors() {
    const colors = React.useContext(GraphColorsContext);
    if (colors === undefined) {
        throw new Error('useGraphColors must be used within a GraphColorsProvider');
    }
    return colors;
}
