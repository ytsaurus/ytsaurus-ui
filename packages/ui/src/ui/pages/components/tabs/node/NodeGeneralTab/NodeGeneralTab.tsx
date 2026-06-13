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
import {selectNode} from '../../../../../store/selectors/components/node/node';

import './NodeGeneralTab.scss';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import i18n from './i18n';

const block = cn('node-general');

function NodeGeneralTab(): ReturnType<React.VFC> {
    const {node} = useSelector(selectNode);

    if (!node) {
        return null;
    }

    if (node.state === 'offline') {
        return <YTErrorBlock type="alert" message={i18n('alert_node-offline')} />;
    }

    return (
        <>
            {hasCpuAndMemoryMeta(node) && (
                <CollapsibleSection
                    size="s"
                    name={i18n('title_compute-resources')}
                    className={block('cpu')}
                    collapsed={false}
                >
                    <NodeCpuAndMemory {...{node}} />
                </CollapsibleSection>
            )}
            {hasStorageMeta(node) && (
                <CollapsibleSection
                    size="s"
                    name={i18n('title_storage')}
                    className={block('storage')}
                    collapsed={false}
                >
                    <NodeStorage {...node} />
                </CollapsibleSection>
            )}
            {hasResourcesMeta(node) && (
                <CollapsibleSection
                    size="s"
                    name={i18n('title_slot-resources')}
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
