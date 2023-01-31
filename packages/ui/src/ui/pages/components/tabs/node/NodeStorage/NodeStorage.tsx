import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Progress} from '@gravity-ui/uikit';
import MetaTable from '../../../../../components/MetaTable/MetaTable';

import type {Node} from '../../../../../store/reducers/components/nodes/nodes/node';
import hammer from '../../../../../common/hammer';

import './NodeStorage.scss';

const block = cn('node-storage');

interface NodeStorageProps {
    chunks: Node['chunks'];
    IOWeight: Node['IOWeight'];
    sessions: Node['sessions'];
    spaceProgress: Node['spaceProgress'];
    spaceText: Node['spaceText'];
}

export const hasStorageMeta = (node: NodeStorageProps) =>
    node.spaceProgress || node.sessions || node.chunks || Object.keys(node.IOWeight).length > 0;

function NodeStorage(node: NodeStorageProps): ReturnType<React.VFC> {
    const ioItems = _.transform(
        node.IOWeight,
        (res, value, key) => res.push({key, value}),
        [] as Array<{key: string; value: number}>,
    );

    return (
        <>
            <MetaTable
                className={block('meta')}
                items={[
                    {
                        key: 'space',
                        value: (
                            <Progress
                                value={node.spaceProgress}
                                text={node.spaceText}
                                theme="success"
                            />
                        ),
                        visible: Boolean(node.spaceProgress),
                    },
                    {
                        key: 'sessions',
                        value: hammer.format['Number'](node.sessions),
                        visible: Boolean(node.sessions),
                    },
                    {
                        key: 'chunks',
                        value: hammer.format['Number'](node.chunks),
                        visible: Boolean(node.chunks),
                    },
                ]}
            />

            {ioItems.length > 0 && <h4 className={block('heading')}>IO weight</h4>}

            <MetaTable items={ioItems} />
        </>
    );
}

export default React.memo(NodeStorage);
