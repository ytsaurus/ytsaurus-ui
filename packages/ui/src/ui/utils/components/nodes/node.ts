import {COMPONENTS_NODES_NODE_TABLE_ID} from '../../../constants/components/nodes/nodes';

interface Node {
    cell_id: string;
    peer_id: string;
    state: string;
}

export const nodeTableProps = {
    size: 's',
    virtual: false,
    theme: 'light',
    cssHover: true,
    striped: false,
    tableId: COMPONENTS_NODES_NODE_TABLE_ID,
    columns: {
        items: {
            cell_id: {
                get(node: Node) {
                    return node.cell_id;
                },
                sort: true,
                align: 'left',
                caption: 'Cell ID',
            },
            peer_id: {
                sort: true,
                get(node: Node) {
                    return node.peer_id;
                },
                align: 'right',
                caption: 'Peer ID',
            },
            state: {
                sort: true,
                get(node: Node) {
                    return node.state;
                },
                align: 'right',
            },
        },
        sets: {
            default: {
                items: ['cell_id', 'peer_id', 'state'],
            },
        },
        mode: 'default',
    },
    templates: {
        key: 'components/nodes/node',
    },
};
