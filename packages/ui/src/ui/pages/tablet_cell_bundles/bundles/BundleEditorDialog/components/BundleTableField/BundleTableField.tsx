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

const resourceColumns: TableColumnConfig<BundleData>[] = [
    {
        id: 'memory',
        get name() {
            return i18n('field_memory');
        },
        width: '25%',
        template: (item) => renderDeprecationAwareValue(item.memory, item.deprecated),
    },
    {
        id: 'vcpu',
        name: 'vCPU',
        width: '25%',
        template: (item) => renderDeprecationAwareValue(item.vcpu, item.deprecated),
    },
    {
        id: 'net',
        get name() {
            return i18n('field_network');
        },
        width: '25%',
        template: (item) => renderDeprecationAwareValue(item.net, item.deprecated),
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
            createRadioColumn(value?.type, onChange, onRadioClick),
            createTypeColumn(value?.type),
            ...resourceColumns,
        ],
        [onChange, onRadioClick, value],
    );

    return <Table className={block('table')} columns={newColumns} data={data} edgePadding />;
}

function createRadioColumn(
    selectedType: string | undefined,
    onChange: BundleTableFieldProps['onChange'],
    onRadioClick: RadioClickType | undefined,
): TableColumnConfig<BundleData> {
    return {
        id: 'radio',
        name: '',
        template: (item) => (
            <Radio
                value={item.id}
                checked={selectedType === item.id}
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
        ),
    };
}

function createTypeColumn(selectedType: string | undefined): TableColumnConfig<BundleData> {
    return {
        id: 'type',
        get name() {
            return i18n('field_type');
        },
        width: '25%',
        template: (item) => (
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
                        <Tooltip
                            content={getDeprecationTooltip(item)}
                            ellipsis
                            qa={`bundle-table-field-type-${item.id}`}
                        >
                            <Text variant="inherit" color="secondary">
                                {item.type}
                            </Text>
                        </Tooltip>
                    ) : (
                        <Text variant="inherit" ellipsis>
                            {item.type}
                        </Text>
                    )}
                </Flex>
                {selectedType === item.id && item.deprecated && (
                    <Flex shrink={0}>
                        <WarningIcon color="warning" hoverContent={getDeprecationTooltip(item)} />
                    </Flex>
                )}
            </Flex>
        ),
    };
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

function renderDeprecationAwareValue(value: string, deprecated?: boolean) {
    const color = deprecated ? 'secondary' : undefined;

    return (
        <Text variant="inherit" color={color}>
            {value}
        </Text>
    );
}

BundleTableField.isEmpty = (value: string) => {
    return !value;
};

BundleTableField.getDefaultValue = () => {
    return '';
};
