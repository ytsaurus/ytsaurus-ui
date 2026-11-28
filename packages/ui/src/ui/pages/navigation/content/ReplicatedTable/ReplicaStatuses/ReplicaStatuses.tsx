import React from 'react';
import {Flex, Spin} from '@gravity-ui/uikit';

import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import Link from '../../../../../containers/Link/Link';
import {YTErrorInline} from '../../../../../containers/YTErrorInline/YTErrorInline';
import {Page} from '../../../../../constants';
import {useReplicaStatuses} from '../../../../../store/api/navigation/replica-statuses';
import {ReplicaStatusesCell} from '../ReplicaStatusesCell/ReplicaStatusesCell';
import i18n from '../i18n';

export function ReplicaStatuses() {
    const {replicas, diagnostics, error, loading} = useReplicaStatuses();

    if (!loading && !error && !replicas.length) {
        return null;
    }

    return (
        <CollapsibleSection name={i18n('title_replica-diagnostics')} marginDirection="bottom">
            <Flex direction="column" gap={3}>
                {error && <YTErrorInline error={error} message={i18n('alert_failed-to-load')} />}
                {loading && <Spin size="s" />}
                {replicas.map(({id, cluster, path}) => (
                    <Flex key={id} direction="column" gap={1}>
                        <Link
                            url={`/${cluster}/${Page.NAVIGATION}?path=${encodeURIComponent(path)}`}
                        >
                            {cluster}:{path}
                        </Link>
                        <ReplicaStatusesCell result={diagnostics?.[id]} />
                    </Flex>
                ))}
            </Flex>
        </CollapsibleSection>
    );
}
