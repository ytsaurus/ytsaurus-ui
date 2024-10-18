import React from 'react';
import ReactDOM from 'react-dom/client';
import {Layer, LayerContext, LayerProps} from '@gravity-ui/graph';
import {Zoom} from './Zoom';

export class ZoomLayer extends Layer {
    protected reactRoot: ReactDOM.Root | undefined;

    constructor(props: LayerProps, context: LayerContext) {
        super(
            {
                html: {
                    zIndex: 5,
                    classNames: ['zoom-layer'],
                },
                ...props,
            },
            context,
        );
        this.reactRoot = undefined;
    }

    unmount() {
        this.reactRoot?.unmount();
        super.unmount();
    }

    protected override afterInit() {
        const container = this.getHTML();
        this.reactRoot = ReactDOM.createRoot(container);
        this.reactRoot.render(<Zoom graph={this.props.graph} layerElement={container} />);
    }
}
