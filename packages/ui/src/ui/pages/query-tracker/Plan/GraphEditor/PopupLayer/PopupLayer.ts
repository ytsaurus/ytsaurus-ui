import {Layer, LayerContext, LayerProps} from '@gravity-ui/graph';

export type AreaLayerProps = LayerProps;
export type AreaLayerContext = LayerContext;
export class PopupLayer extends Layer<AreaLayerProps, AreaLayerContext> {
    constructor(props: AreaLayerProps, context: AreaLayerContext) {
        super(
            {
                ...props,
                html: {
                    zIndex: 6,
                    classNames: ['graph-popup-layer'],
                },
            },
            context,
        );

        this.context.camera.on('update', this.updateHTMLCamera);
    }

    updateHTMLCamera = () => {
        const state = this.context.camera.getCameraState();
        this.getHTML().style.transform = `matrix(${state.scale}, 0, 0, ${state.scale}, ${state.x}, ${state.y})`;
        this.getHTML().style.setProperty('--nv-graph-scale', `${state.scale}`);
    };

    protected afterInit() {
        const html = this.getHTML();

        html.style.position = 'absolute';
        html.style.top = '0';
        html.style.left = '0';
        html.style.isolation = 'isolate';
        html.style.transformOrigin = '0 0';
        html.style.transformStyle = 'preserve-3d';
        html.style.willChange = 'transform';
        html.style.pointerEvents = 'none';
    }

    protected unmount(): void {
        super.unmount();
        this.context.camera.off('update', this.updateHTMLCamera);
    }
}
