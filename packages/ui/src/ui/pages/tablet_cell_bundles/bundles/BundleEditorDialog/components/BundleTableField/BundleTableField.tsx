import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';

import {Radio, Table, TableColumnConfig} from '@gravity-ui/uikit';

import {DialogControlProps} from '../../../../../../components/Dialog/Dialog.types';
import {BundleResourceGuarantee} from '../../../../../../store/reducers/tablet_cell_bundles';

import './BundleTableField.scss';

const block = cn('bundle-table-field');

const columns: TableColumnConfig<BundleData>[] = [
    {id: 'type', name: 'Type', width: '25%'},
    {id: 'memory', name: 'Memory', width: '25%'},
    {id: 'vcpu', name: 'vCPU', width: '25%'},
    {id: 'net', name: 'Network', width: '25%'},
];

interface BundleData {
    type: string;
    memory: string;
    vcpu: string;
    net: string;
    disabled?: boolean;
    initialData: BundleResourceGuarantee;
    [k: string]: any;
}

type RadioClickType = (value: BundleResourceGuarantee) => void;

type BundleTableFieldProps = DialogControlProps<
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
            ...columns,
        ],
        [data, value],
    );

    return <Table className={block('table')} columns={newColumns} data={data} edgePadding />;
}

BundleTableField.isEmpty = (value: string) => {
    return !value;
};

BundleTableField.getDefaultValue = () => {
    return '';
};
