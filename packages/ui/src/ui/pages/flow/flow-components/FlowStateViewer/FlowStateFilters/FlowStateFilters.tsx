import React from 'react';
import cn from 'bem-cn-lite';

import {Button, Card, Flex, HelpMark, Select, Text, TextInput} from '@gravity-ui/uikit';

import {SelectSingle} from '../../../../../components/Select/Select';
import {useFlowExecuteQuery} from '../../../../../store/api/yt/flow';

import {FlowStateKeyBuilder} from '../FlowStateKeyBuilder/FlowStateKeyBuilder';
import {
    clampLimit,
    getAvailableStateTargets,
    getComputationStateNames,
    getStateNameInputMode,
    getStateNameSelectItems,
    reconcileStateName,
    reconcileStateTarget,
    resolveKeySchema,
} from '../state-filters';
import i18n from './i18n';
import i18nApiValues from '../i18n-api-values';
import type {FlowStateFiltersValue} from '../types';
import type {FlowStateTarget, FlowStaticSpec} from '../../../../../../shared/yt-types';

import './FlowStateFilters.scss';

const block = cn('yt-flow-state-filters');

export type FlowStateFiltersProps = {
    pipeline_path: string;
    value: FlowStateFiltersValue;
    onChange: (value: FlowStateFiltersValue) => void;
    onReset: () => void;
    fixedComputationId?: string;
    staticSpec?: FlowStaticSpec;
};

type FlowStateApiValueKey = Parameters<typeof i18nApiValues>[0];

const TARGET_OPTIONS: Array<{value: FlowStateTarget; textKey: FlowStateApiValueKey}> = [
    {value: 'all', textKey: 'value_kind-all'},
    {value: 'key_state', textKey: 'value_kind-internal-key'},
    {value: 'partition_state', textKey: 'value_kind-internal-partition'},
    {value: 'external_key_state', textKey: 'value_kind-external'},
];

function toItems(values: Array<string>) {
    return values.map((value) => ({value}));
}

function PartitionSelect({
    pipeline_path,
    computationId,
    value,
    onChange,
}: {
    pipeline_path: string;
    computationId: string;
    value?: string;
    onChange: (partitionId?: string) => void;
}) {
    const {data} = useFlowExecuteQuery<'describe-computation'>({
        parameters: {pipeline_path, flow_command: 'describe-computation'},
        body: {computation_id: computationId},
    });
    const items = React.useMemo(
        () =>
            (data?.partitions ?? []).map(({partition_id}) => ({
                value: partition_id,
                text: partition_id,
            })),
        [data],
    );
    return (
        <SelectSingle
            className={block('control')}
            width="max"
            label={i18n('field_partition')}
            placeholder={i18n('field_partition')}
            value={value}
            items={items}
            hasClear
            onChange={onChange}
        />
    );
}

export function FlowStateFilters({
    pipeline_path,
    value,
    onChange,
    onReset,
    fixedComputationId,
    staticSpec,
}: FlowStateFiltersProps) {
    const {data: pipelineData} = useFlowExecuteQuery<'describe-pipeline'>({
        parameters: {pipeline_path, flow_command: 'describe-pipeline'},
        body: {},
    });

    const computationItems = React.useMemo(
        () => toItems(Object.keys(pipelineData?.computations ?? {})),
        [pipelineData],
    );

    const {keyColumns} = resolveKeySchema(
        staticSpec,
        value.computationId,
        value.stateName,
        value.target,
    );
    const stateNames = getComputationStateNames(staticSpec, value.computationId, value.target);
    const availableTargets = getAvailableStateTargets(staticSpec, value.computationId);

    const handleComputation = (computationId?: string) => {
        onChange({
            ...value,
            computationId,
            partitionId: undefined,
            keyValues: {},
            stateName: undefined,
            target: reconcileStateTarget(staticSpec, computationId, value.target),
        });
    };

    return (
        <Flex direction="column" gap={3}>
            <Flex gap={2} wrap alignItems="flex-end">
                <SelectSingle
                    className={block('control')}
                    width="max"
                    label={i18n('field_computation')}
                    placeholder={i18n('field_computation')}
                    value={value.computationId}
                    items={computationItems}
                    disabled={Boolean(fixedComputationId)}
                    hasClear
                    onChange={handleComputation}
                />
                {value.computationId ? (
                    <PartitionSelect
                        pipeline_path={pipeline_path}
                        computationId={value.computationId}
                        value={value.partitionId}
                        onChange={(partitionId) => onChange({...value, partitionId})}
                    />
                ) : (
                    <SelectSingle
                        className={block('control')}
                        width="max"
                        label={i18n('field_partition')}
                        placeholder={i18n('field_partition')}
                        items={[]}
                        disabled
                    />
                )}
                <Select
                    className={block('control')}
                    width="max"
                    value={[value.target]}
                    multiple={false}
                    options={TARGET_OPTIONS.map(({value: target, textKey}) => ({
                        value: target,
                        content: i18nApiValues(textKey),
                        disabled: !availableTargets[target],
                        title: availableTargets[target]
                            ? undefined
                            : i18n('hint_target-unavailable'),
                    }))}
                    onUpdate={([next]) => {
                        const target = next as FlowStateTarget;
                        onChange({
                            ...value,
                            target,
                            keyValues: target === 'partition_state' ? {} : value.keyValues,
                            stateName: reconcileStateName(
                                value.stateName,
                                target,
                                getComputationStateNames(staticSpec, value.computationId, target),
                            ),
                        });
                    }}
                />
                {getStateNameInputMode(value.target) === 'free-form' ? (
                    <TextInput
                        className={block('control')}
                        label={i18n('field_state-name')}
                        placeholder={i18n('field_state-name')}
                        value={value.stateName ?? ''}
                        hasClear
                        onUpdate={(stateName) =>
                            onChange({...value, stateName: stateName || undefined})
                        }
                    />
                ) : (
                    <SelectSingle
                        className={block('control')}
                        width="max"
                        label={i18n('field_state-name')}
                        placeholder={i18n('field_state-name')}
                        value={value.stateName}
                        items={toItems(
                            getStateNameInputMode(value.target) === 'suggested'
                                ? getStateNameSelectItems(stateNames, value.stateName)
                                : stateNames,
                        )}
                        hasClear
                        onChange={(stateName) => onChange({...value, stateName})}
                    />
                )}
                <Flex gap={1} alignItems="center">
                    <TextInput
                        className={block('control', {narrow: true})}
                        label={i18n('field_limit')}
                        type="number"
                        value={String(value.limit)}
                        onUpdate={(raw) => onChange({...value, limit: clampLimit(Number(raw))})}
                    />
                    <HelpMark iconSize="s">{i18n('hint_limit')}</HelpMark>
                </Flex>
                <Button view="outlined" onClick={onReset}>
                    {i18n('action_reset-filters')}
                </Button>
            </Flex>
            {value.computationId && !value.partitionId && keyColumns.length > 0 && (
                <Card view="outlined" className={block('key-group')}>
                    <Flex gap={2} alignItems="flex-start">
                        <Text variant="subheader-2" className={block('key-group-label')}>
                            {i18n('field_key')}
                        </Text>
                        <FlowStateKeyBuilder
                            columns={keyColumns}
                            values={value.keyValues}
                            onChange={(keyValues) =>
                                onChange({
                                    ...value,
                                    keyValues,
                                    target:
                                        value.target === 'partition_state' ? 'all' : value.target,
                                })
                            }
                        />
                    </Flex>
                </Card>
            )}
        </Flex>
    );
}
