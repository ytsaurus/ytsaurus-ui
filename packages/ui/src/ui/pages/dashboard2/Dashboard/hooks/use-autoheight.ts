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
            const widgetLayout = widget.layout.find((item) => item.i === widget.id);
            widget.adjustWidgetLayout({
                widgetId: widget.id,
                adjustedWidgetLayout: {
                    h: dataLength ? mayBeHeight : defaultHeight,
                    i: widget.id,
                    w: widgetLayout?.w || 0,
                    x: widgetLayout?.x || 0,
                    y: widgetLayout?.y || 0,
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
