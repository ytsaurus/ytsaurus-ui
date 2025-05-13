import {useEffect} from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

// 1 react-grid value ~ 25.3px
export type LayoutConfig = {
    baseHeight: number;
    defaultHeight: number;

    rowHeight: number;

    minWidth: number;
};

export function useAutoHeight(
    widget: PluginWidgetProps,
    layoutConfig: LayoutConfig,
    dataLength: number,
) {
    const {baseHeight, rowHeight, defaultHeight, minWidth} = layoutConfig;

    useEffect(() => {
        if (widget.data?.autoheight) {
            const mayBeHeight = baseHeight + dataLength * rowHeight;
            widget.adjustWidgetLayout({
                widgetId: widget.id,
                adjustedWidgetLayout: {
                    h: dataLength ? mayBeHeight : defaultHeight,
                    i: widget.id,
                    w: widget.layout.find((item) => item.i === widget.id)?.w || 0,
                    x: widget.layout.find((item) => item.i === widget.id)?.x || 0,
                    y: widget.layout.find((item) => item.i === widget.id)?.y || 0,
                    minH: mayBeHeight,
                    maxH: mayBeHeight,
                    minW: minWidth,
                },
            });
        } else {
            widget.adjustWidgetLayout({
                widgetId: widget.id,
                needSetDefault: true,
            });
        }
    }, [widget?.data?.autoheight]);
}
