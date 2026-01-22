import {useSelector} from '../../../../../store/redux-hooks';
import React from 'react';
import cn from 'bem-cn-lite';

import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import NodeCpuAndMemory, {
    hasCpuAndMemoryMeta,
} from '../../../../../pages/components/tabs/node/NodeCpuAndMemory/NodeCpuAndMemory';
import NodeResources, {
    hasResourcesMeta,
} from '../../../../../pages/components/tabs/node/NodeResources/NodeResources';
import NodeStorage, {
    hasStorageMeta,
} from '../../../../../pages/components/tabs/node/NodeStorage/NodeStorage';
import {nodeSelector} from '../../../../../store/selectors/components/node/node';

import './NodeGeneralTab.scss';
import {YTAlertBlock} from '../../../../../components/Alert/Alert';

const block = cn('node-general');

function NodeGeneralTab(): ReturnType<React.VFC> {
    const {node} = useSelector(nodeSelector);

    if (!node) {
        return null;
    }

    if (node.state === 'offline') {
        return <YTAlertBlock message="Node is offline" />;
    }

    return (
        <>
            {hasCpuAndMemoryMeta(node) && (
                <CollapsibleSection
                    size="s"
                    name="Compute Resources"
                    className={block('cpu')}
                    collapsed={false}
                >
                    <NodeCpuAndMemory {...{node}} />
                </CollapsibleSection>
            )}
            {hasStorageMeta(node) && (
                <CollapsibleSection
                    size="s"
                    name="Storage"
                    className={block('storage')}
                    collapsed={false}
                >
                    <NodeStorage {...node} />
                </CollapsibleSection>
            )}
            {hasResourcesMeta(node) && (
                <CollapsibleSection
                    size="s"
                    name="Slot Resources"
                    className={block('resources')}
                    collapsed={false}
                >
                    <NodeResources {...node} />
                </CollapsibleSection>
            )}
        </>
    );
}

export default React.memo(NodeGeneralTab);
