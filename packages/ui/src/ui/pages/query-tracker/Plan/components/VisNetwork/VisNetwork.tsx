import * as React from 'react';

import cn from 'bem-cn-lite';
import type {DataSetEdges, DataSetNodes, Network, Options} from 'vis-network';

const block = cn('vis-network');

export default function VisNetwork({
    nodes,
    edges,
    options,
    className,
    getNetwork,
}: {
    nodes: DataSetNodes;
    edges: DataSetEdges;
    options: Options;
    className?: string;
    getNetwork?: (network: Network) => void;
}) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [network, setNetwork] = React.useState<Network>();

    React.useEffect(() => {
        let newNetwork: Network;
        import(/* webpackChunkName: "vis-network" */ 'vis-network').then(
            ({Network: NetworkClass}) => {
                newNetwork = new NetworkClass(containerRef.current!, {});
                setNetwork(newNetwork);
            },
        );
        return () => {
            newNetwork?.destroy();
        };
    }, []);

    React.useEffect(() => {
        if (network) {
            network.setData({nodes, edges});
            network.once('afterDrawing', () => {
                network.fit();
            });
        }
    }, [nodes, edges, network]);

    React.useEffect(() => {
        if (network) {
            network.setOptions(options);
        }
    }, [options, network]);

    React.useEffect(() => {
        if (network && typeof getNetwork === 'function') {
            getNetwork(network);
        }
    }, [getNetwork, network]);

    return <div ref={containerRef} className={block(null, className)} />;
}
