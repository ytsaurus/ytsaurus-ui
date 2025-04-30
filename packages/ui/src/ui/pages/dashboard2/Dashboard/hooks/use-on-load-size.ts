import {useEffect} from 'react';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

export type LayoutConfig = {
    baseHeight: number;
    defaultHeight: number;

    rowMultiplier: number;

    minHeight: number;
    minWidth: number;
};

export function useOnLoadSize(widget: PluginWidgetProps, config: LayoutConfig, dataLength: number) {
    const {baseHeight, defaultHeight, rowMultiplier, minHeight, minWidth} = config;

    useEffect(() => {
        const mayBeHeight = baseHeight + dataLength * rowMultiplier;
        if (mayBeHeight <= defaultHeight && dataLength) {
            widget.adjustWidgetLayout({
                widgetId: widget.id,
                adjustedWidgetLayout: {
                    h: mayBeHeight,
                    i: widget.id,
                    w: widget.layout.find((item) => item.i === widget.id)?.w || 0,
                    x: widget.layout.find((item) => item.i === widget.id)?.x || 0,
                    y: widget.layout.find((item) => item.i === widget.id)?.y || 0,
                    maxH: mayBeHeight,
                    minH: minHeight,
                    minW: minWidth,
                },
            });
        } else {
            widget.adjustWidgetLayout({
                widgetId: widget.id,
                adjustedWidgetLayout: {
                    h: defaultHeight,
                    i: widget.id,
                    w: widget.layout.find((item) => item.i === widget.id)?.w || 0,
                    x: widget.layout.find((item) => item.i === widget.id)?.x || 0,
                    y: widget.layout.find((item) => item.i === widget.id)?.y || 0,
                    maxH: mayBeHeight,
                    minH: minHeight,
                    minW: minWidth,
                },
            });
        }
    }, [dataLength]);
}
