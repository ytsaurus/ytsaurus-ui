import type {Placeholder, Visualization} from '../types';

type VisualizationPlaceholders = {
    xPlaceholder: Placeholder | undefined;
    yPlaceholder: Placeholder | undefined;
    colorPlaceholder: Placeholder | undefined;
};

export function getVisualizationPlaceholders(
    visualization: Visualization,
): VisualizationPlaceholders {
    return visualization.placeholders.reduce(
        (acc: VisualizationPlaceholders, placeholder) => {
            if (placeholder.id === 'x') {
                acc.xPlaceholder = placeholder;
            }

            if (placeholder.id === 'y') {
                acc.yPlaceholder = placeholder;
            }

            if (placeholder.id === 'colors') {
                acc.colorPlaceholder = placeholder;
            }

            return acc;
        },
        {
            xPlaceholder: undefined,
            yPlaceholder: undefined,
            colorPlaceholder: undefined,
        },
    );
}
