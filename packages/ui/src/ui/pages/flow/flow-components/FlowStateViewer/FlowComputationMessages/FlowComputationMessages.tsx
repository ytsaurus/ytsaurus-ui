import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Text} from '@gravity-ui/uikit';

import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import {
    DataTableGravity,
    TableCell,
    type tanstack,
    useTable,
} from '../../../../../components/DataTableGravity';
import {RoutedLink} from '../../../../../containers/RoutedLink/RoutedLink';
import {FlowMessagesCollapsible} from '../../../../../pages/flow/flow-components/FlowMessagesCollapsible/FlowMessagesCollapsible';
import {selectCluster} from '../../../../../store/selectors/global';

import {useSelector} from '../../../../../store/redux-hooks';

import {useFlowStaticSpecQuery} from '../../../../../store/api/yt/flow';
import {getComputationGroupByColumns, getComputationKeyColumns} from '../state-filters';
import {keyValuesFromRowKey} from '../state-values';
import {
    buildHeavyHitterStateLink,
    parseHeavyHitterKeyText,
    splitHeavyHittersMessages,
} from '../heavy-hitters';
import i18n from './i18n';
import type {FlowHeavyHitterEntry} from '../types';
import type {FlowMessageType} from '../../../../../../shared/yt-types';

import './FlowComputationMessages.scss';

const block = cn('yt-flow-computation-messages');

export type FlowComputationMessagesProps = {
    path: string;
    computation: string;
    messages?: Array<FlowMessageType>;
};

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
    const {data: staticSpec} = useFlowStaticSpecQuery({parameters: {pipeline_path: path}});
    const keyColumns = getComputationKeyColumns(staticSpec, computation);
    const allKeyColumns = getComputationGroupByColumns(staticSpec, computation);

    const columns = React.useMemo<Array<tanstack.ColumnDef<FlowHeavyHitterEntry>>>(
        () => [
            {
                id: 'keyText',
                header: () => i18n('column_key'),
                size: 480,
                accessorFn: (row) => row.keyText,
                cell: ({row: {original}}) => {
                    const tokens = parseHeavyHitterKeyText(original.keyText);
                    const keyValues =
                        tokens && keyValuesFromRowKey(tokens, keyColumns, allKeyColumns);
                    return (
                        <TableCell>
                            {keyValues ? (
                                <RoutedLink
                                    href={buildHeavyHitterStateLink(cluster, path, computation, {
                                        keyValues,
                                    })}
                                    title={i18n('action_open-in-state')}
                                >
                                    {original.keyText}
                                </RoutedLink>
                            ) : (
                                original.keyText
                            )}
                        </TableCell>
                    );
                },
            },
            {
                id: 'ratio',
                header: () => i18n('column_ratio'),
                size: 120,
                accessorFn: (row) => row.ratio,
                cell: ({row: {original}}) => <TableCell>{String(original.ratio)}</TableCell>,
            },
            {
                id: 'partitionId',
                header: () => i18n('column_partition'),
                size: 320,
                accessorFn: (row) => row.partitionId,
                cell: ({row: {original}}) => (
                    <TableCell>
                        <RoutedLink
                            href={buildHeavyHitterStateLink(cluster, path, computation, {
                                partitionId: original.partitionId,
                            })}
                            title={i18n('action_open-in-state')}
                        >
                            {original.partitionId}
                        </RoutedLink>
                    </TableCell>
                ),
            },
        ],
        [cluster, path, computation, keyColumns, allKeyColumns],
    );

    const entries = React.useMemo(() => heavyHitters?.entries ?? [], [heavyHitters]);
    const table = useTable({columns, data: entries});

    return (
        <React.Fragment>
            <FlowMessagesCollapsible messages={otherMessages} />
            {heavyHitters ? (
                <CollapsibleSection name={heavyHitters.title || i18n('title_heavy-hitters')}>
                    <Flex direction="column" gap={2} className={block()}>
                        {heavyHitters.entries.length > 0 && (
                            <DataTableGravity
                                table={table}
                                virtualized
                                rowHeight={40}
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
