import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Table, type TableColumnConfig, Text} from '@gravity-ui/uikit';

import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import Link from '../../../../../containers/Link/Link';
import {FlowMessagesCollapsible} from '../../../../../pages/flow/flow-components/FlowMessagesCollapsible/FlowMessagesCollapsible';
import {selectCluster} from '../../../../../store/selectors/global';

import {useSelector} from '../../../../../store/redux-hooks';

import {fetchSpec} from '../flow-state-api';
import {
    buildHeavyHitterStateLink,
    getComputationGroupByColumns,
    getComputationKeyColumns,
    keyValuesFromRowKey,
    parseHeavyHitterKeyText,
    splitHeavyHittersMessages,
} from '../helpers';
import i18n from './i18n';
import type {FlowHeavyHitterEntry, FlowStaticSpec} from '../types';
import type {FlowMessageType} from '../../../../../../shared/yt-types';

import './FlowComputationMessages.scss';

const block = cn('yt-flow-computation-messages');

export type FlowComputationMessagesProps = {
    path: string;
    computation: string;
    messages?: Array<FlowMessageType>;
};

function useStaticSpec(pipelinePath: string): FlowStaticSpec | undefined {
    const [staticSpec, setStaticSpec] = React.useState<FlowStaticSpec>();

    React.useEffect(() => {
        let cancelled = false;
        fetchSpec(pipelinePath)
            .then((data) => {
                if (!cancelled) {
                    setStaticSpec(data.spec as FlowStaticSpec);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setStaticSpec(undefined);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [pipelinePath]);

    return staticSpec;
}

export function FlowComputationMessages({
    path,
    computation,
    messages,
}: FlowComputationMessagesProps) {
    const cluster = useSelector(selectCluster);
    const {heavyHitters, otherMessages} = React.useMemo(
        () => splitHeavyHittersMessages(messages),
        [messages],
    );
    const staticSpec = useStaticSpec(path);
    const keyColumns = getComputationKeyColumns(staticSpec, computation);
    const allKeyColumns = getComputationGroupByColumns(staticSpec, computation);

    const columns = React.useMemo<Array<TableColumnConfig<FlowHeavyHitterEntry>>>(
        () => [
            {
                id: 'keyText',
                name: () => i18n('column_key'),
                template: (row) => {
                    const tokens = parseHeavyHitterKeyText(row.keyText);
                    const keyValues =
                        tokens && keyValuesFromRowKey(tokens, keyColumns, allKeyColumns);
                    if (!keyValues) {
                        return row.keyText;
                    }
                    return (
                        <Link
                            url={buildHeavyHitterStateLink(cluster, path, computation, {keyValues})}
                            routed
                            title={i18n('action_open-in-state')}
                        >
                            {row.keyText}
                        </Link>
                    );
                },
            },
            {
                id: 'ratio',
                name: () => i18n('column_ratio'),
                template: (row) => String(row.ratio),
            },
            {
                id: 'partitionId',
                name: () => i18n('column_partition'),
                template: (row) => (
                    <Link
                        url={buildHeavyHitterStateLink(cluster, path, computation, {
                            partitionId: row.partitionId,
                        })}
                        routed
                        title={i18n('action_open-in-state')}
                    >
                        {row.partitionId}
                    </Link>
                ),
            },
        ],
        [cluster, path, computation, keyColumns, allKeyColumns],
    );

    return (
        <React.Fragment>
            <FlowMessagesCollapsible messages={otherMessages} />
            {heavyHitters ? (
                <CollapsibleSection name={heavyHitters.title || i18n('title_heavy-hitters')}>
                    <Flex direction="column" gap={2} className={block()}>
                        {heavyHitters.entries.length > 0 && (
                            <Table
                                data={heavyHitters.entries}
                                columns={columns}
                                width="max"
                                className={block('table')}
                            />
                        )}
                        {heavyHitters.unparsedEntries.map((line, index) => (
                            <Text key={`${index}:${line}`} color="secondary">
                                {line}
                            </Text>
                        ))}
                    </Flex>
                </CollapsibleSection>
            ) : null}
        </React.Fragment>
    );
}

export default FlowComputationMessages;
