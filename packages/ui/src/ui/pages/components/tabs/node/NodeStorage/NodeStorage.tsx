import React from 'react';
import cn from 'bem-cn-lite';

import transform_ from 'lodash/transform';

import {Progress} from '@gravity-ui/uikit';
import {MetaTable} from '@ytsaurus/components';

import {type Node} from '../../../../../store/reducers/components/nodes/nodes/node';
import hammer from '../../../../../common/hammer';

import i18n from './i18n';

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
    const ioItems = transform_(
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
                        label: i18n('field_space'),
                        value: (
                            <Progress
                                value={node.spaceProgress || 0}
                                text={node.spaceText}
                                theme="success"
                            />
                        ),
                    },
                    {
                        key: 'sessions',
                        label: i18n('field_sessions'),
                        value: hammer.format['Number'](node.sessions),
                    },
                    {
                        key: 'chunks',
                        label: i18n('field_chunks'),
                        value: hammer.format['Number'](node.chunks),
                    },
                ]}
            />

            {ioItems.length > 0 && <h4 className={block('heading')}>{i18n('title_io-weight')}</h4>}

            <MetaTable items={ioItems} />
        </>
    );
}

export default React.memo(NodeStorage);
