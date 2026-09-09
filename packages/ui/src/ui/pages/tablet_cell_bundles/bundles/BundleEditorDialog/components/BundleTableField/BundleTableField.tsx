import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';

import {Flex, Radio, Table, type TableColumnConfig, Text} from '@gravity-ui/uikit';
import {Tooltip} from '@ytsaurus/components';

import WarningIcon from '../../../../../../components/WarningIcon/WarningIcon';
import {type DialogControlProps} from '../../../../../../containers/Dialog/Dialog.types';
import {type BundleResourceGuarantee} from '../../../../../../store/reducers/tablet_cell_bundles';

import i18n from './i18n';

import './BundleTableField.scss';

const block = cn('bundle-table-field');

const columns: TableColumnConfig<BundleData>[] = [
    {
        id: 'type',
        get name() {
            return i18n('field_type');
        },
        width: '25%',
    },
    {
        id: 'memory',
        get name() {
            return i18n('field_memory');
        },
        width: '25%',
        template: (item) => renderValue(item, item.memory),
    },
    {
        id: 'vcpu',
        name: 'vCPU',
        width: '25%',
        template: (item) => renderValue(item, item.vcpu),
    },
    {
        id: 'net',
        get name() {
            return i18n('field_network');
        },
        width: '25%',
        template: (item) => renderValue(item, item.net),
    },
];

export interface BundleData {
    id: string;
    type: string;
    memory: string;
    vcpu: string;
    net: string; // deprecated
    net_bytes?: string;
    disabled?: boolean;
    deprecated?: boolean;
    deprecationReason?: string;
    initialData: BundleResourceGuarantee;
}

type RadioClickType = (value: BundleResourceGuarantee) => void;

export type BundleTableFieldProps = DialogControlProps<
    BundleResourceGuarantee | undefined,
    {data: BundleData[]; onRadioClick?: RadioClickType}
>;

export function BundleTableField(props: BundleTableFieldProps) {
    const {value, onChange, onRadioClick, data} = props;

    const newColumns = useMemo(
        () => [
            {
                id: 'radio',
                name: '',
                template: (item: BundleData) => {
                    const checked = value?.type === item.id;
                    return (
                        <Radio
                            value={item.id}
                            checked={checked}
                            onUpdate={(isChecked) => {
                                if (isChecked) {
                                    onChange(item.initialData);

                                    if (typeof onRadioClick === 'function') {
                                        onRadioClick(item.initialData);
                                    }
                                }
                            }}
                            disabled={item.disabled}
                        />
                    );
                },
            },
            {
                ...columns[0],
                template: (item: BundleData) => {
                    const checked = value?.type === item.id;

                    return (
                        <Flex alignItems="center" gap={1} style={{maxWidth: '100%', minWidth: 0}}>
                            <Flex
                                shrink={1}
                                overflow="hidden"
                                style={{
                                    minWidth: 0,
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {item.deprecated ? (
                                    <Tooltip content={getDeprecationTooltip(item)} ellipsis>
                                        <Text variant="inherit" color="secondary">
                                            {item.type}
                                        </Text>
                                    </Tooltip>
                                ) : (
                                    item.type
                                )}
                            </Flex>
                            {checked && item.deprecated && (
                                <Flex shrink={0}>
                                    <WarningIcon
                                        color="warning"
                                        hoverContent={getDeprecationTooltip(item)}
                                    />
                                </Flex>
                            )}
                        </Flex>
                    );
                },
            },
            ...columns.slice(1),
        ],
        [onChange, onRadioClick, value],
    );

    return <Table className={block('table')} columns={newColumns} data={data} edgePadding />;
}

function getDeprecationMessage(item: BundleData) {
    return item.deprecationReason
        ? i18n('context_deprecated-reason', {reason: item.deprecationReason})
        : i18n('context_deprecated');
}

function getDeprecationTooltip(item: BundleData) {
    return (
        <Flex direction="column">
            <Text variant="inherit">{item.type}</Text>
            <Text variant="inherit">{getDeprecationMessage(item)}</Text>
        </Flex>
    );
}

function renderValue(item: BundleData, value: string) {
    return item.deprecated ? (
        <Text variant="inherit" color="secondary">
            {value}
        </Text>
    ) : (
        value
    );
}

BundleTableField.isEmpty = (value: string) => {
    return !value;
};

BundleTableField.getDefaultValue = () => {
    return '';
};
