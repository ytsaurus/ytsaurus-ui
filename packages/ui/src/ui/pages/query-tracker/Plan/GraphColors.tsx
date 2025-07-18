import * as React from 'react';

import {useThemeValue} from '@gravity-ui/uikit';
import isEqual_ from 'lodash/isEqual';
import {getCssColor} from '../../../utils/get-css-color';

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
        return getCssColor(name, {container});
    };
    return {
        operation: {
            new: getColor('--yql-graph-color-operation-new'),
            newBorder: getColor('--yql-graph-color-operation-new-border'),
            newBackground: getColor('--yql-graph-color-operation-new-background'),
            pending: getColor('--yql-graph-color-operation-pending'),
            completed: getColor('--yql-graph-color-operation-completed'),
            completedBorder: getColor('--yql-graph-color-operation-completed-border'),
            completedBackground: getColor('--yql-graph-color-operation-completed-background'),
            aborted: getColor('--yql-graph-color-operation-aborted'),
            abortedBorder: getColor('--yql-graph-color-operation-aborted-border'),
            abortedBackground: getColor('--yql-graph-color-operation-aborted-background'),
            failed: getColor('--yql-graph-color-operation-failed'),
            failedBorder: getColor('--yql-graph-color-operation-failed-border'),
            failedBackground: getColor('--yql-graph-color-operation-failed-background'),
            running: getColor('--yql-graph-color-operation-running'),
            runningBorder: getColor('--yql-graph-color-operation-running-border'),
            runningBackground: getColor('--yql-graph-color-operation-running-background'),
            started: getColor('--yql-graph-color-operation-started'),
            startedBorder: getColor('--yql-graph-color-operation-started-border'),
            startedBackground: getColor('--yql-graph-color-operation-started-background'),
        },
        table: {
            fill1: getColor('--yql-graph-color-table-fill1'),
            fill2: getColor('--yql-graph-color-table-fill2'),
        },
        edge: {
            color: getColor('--yql-graph-color-edge'),
            highlight: getColor('--yql-graph-color-edge-highlight'),
        },
        text: {
            label: getColor('--yql-graph-color-text-label'),
            link: getColor('--yql-graph-color-text-link'),
            operationCount: getColor('--yql-graph-color-text-operation-count'),
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
