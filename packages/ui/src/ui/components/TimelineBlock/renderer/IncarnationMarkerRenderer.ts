import {
    AbstractMarkerRenderer,
    LabelSize,
    TimelineMarker,
    ViewConfiguration,
    clamp,
} from '@gravity-ui/timeline';

const DEFAULT_FONT = '10px sans-serif';
const DEFAULT_LABEL_PADDING = 4;
const DEFAULT_LABEL_COLOR = '#333';
const DEFAULT_LABEL_LINE_WIDTH = 1;

export type IncarnationMarker = TimelineMarker & {
    incarnationId: string;
};

export class IncarnationMarkerRenderer<
    TMarker extends TimelineMarker,
> extends AbstractMarkerRenderer<TMarker> {
    render({
        ctx,
        isSelected,
        isHovered,
        marker,
        markerPosition,
        viewConfiguration,
        lastRenderedLabelPosition,
        getLabelSize,
    }: {
        ctx: CanvasRenderingContext2D;
        marker: TimelineMarker;
        isSelected: boolean;
        isHovered: boolean;
        markerPosition: number;
        viewConfiguration: ViewConfiguration;
        lastRenderedLabelPosition: {top: number; bottom: number};
        getLabelSize: (label: string) => LabelSize;
    }) {
        const {markers} = viewConfiguration;

        let color = isHovered ? marker.hoverColor : marker.color;
        if (marker.group) {
            color = (isHovered ? markers?.groupColorHover : markers?.groupColor) || marker.color;
        }
        if (isSelected) {
            color = marker.activeColor;
        }

        // Draw marker line
        ctx.strokeStyle = color;
        ctx.lineWidth = marker.lineWidth || DEFAULT_LABEL_LINE_WIDTH;
        if (marker.group) {
            ctx.setLineDash([5, 3]);
        } else {
            ctx.setLineDash([]);
        }
        ctx.beginPath();
        ctx.moveTo(markerPosition, 0);
        ctx.lineTo(markerPosition, ctx.canvas.height);
        ctx.stroke();

        if (!marker.label) return;

        if (isHovered || isSelected || marker.group) {
            this.renderLabel(
                ctx,
                color,
                marker,
                markerPosition,
                viewConfiguration.markers,
                lastRenderedLabelPosition,
                getLabelSize,
            );
        }
    }

    protected renderLabel(
        ctx: CanvasRenderingContext2D,
        color: string,
        marker: TimelineMarker,
        markerPosition: number,
        markerConfiguration: ViewConfiguration['markers'],
        lastRenderedLabelPosition: {top: number; bottom: number},
        getLabelSize: (label: string) => LabelSize,
    ) {
        const {width, height} = getLabelSize(marker.label!);
        const widthWithPadding = width + DEFAULT_LABEL_PADDING * 2;
        const heightWithPadding = height + DEFAULT_LABEL_PADDING * 2;
        //
        const labelPosition = clamp(
            markerPosition - widthWithPadding / 2, // Center label on marker
            0, // Don't go past the left edge
            Math.min(ctx.canvas.width, lastRenderedLabelPosition['top']) - widthWithPadding, // Don't overlap previous labels
        );

        ctx.font = markerConfiguration?.font || DEFAULT_FONT;
        ctx.fillStyle = color;
        ctx.roundRect(labelPosition, 0, widthWithPadding, heightWithPadding, 4);
        ctx.fill();

        //Draw label text
        ctx.fillStyle = marker.labelColor || DEFAULT_LABEL_COLOR;
        ctx.fillText(
            marker.label!,
            labelPosition + DEFAULT_LABEL_PADDING,
            height + DEFAULT_LABEL_PADDING,
        );
    }
}
