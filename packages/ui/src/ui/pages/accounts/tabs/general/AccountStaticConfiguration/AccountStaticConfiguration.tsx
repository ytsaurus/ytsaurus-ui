import React from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {
    AccountStaticConfigurationItem,
    getActiveAccount,
    getActiveAccountStaticConfiguration,
} from '../../../../../store/selectors/accounts/accounts-ts';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import {getUISizes} from '../../../../../store/selectors/global';
import DataTableYT from '../../../../../components/DataTableYT/DataTableYT';
import {Column} from '@gravity-ui/react-data-table';
import hammer from '../../../../../common/hammer';
import {setSettingsAccountsExpandStaticConfiguration} from '../../../../../store/actions/settings/settings';

import './AccountStaticConfiguration.scss';
import {getSettingsAccountsExpandStaticConfiguration} from '../../../../../store/selectors/settings-ts';
const block = cn('account-static-configuration');

interface Props {
    className?: string;
}

const columns: Array<Column<AccountStaticConfigurationItem>> = [
    {
        name: 'name',
        header: '',
        sortable: false,
        width: 200,
        render: (row) => {
            const {name, level} = row?.row || {};
            return <span className={block('name', {level: level as any})}>{name}</span>;
        },
    },
    {
        name: 'limit',
        header: 'Limit',
        sortable: false,
        width: 100,
        accessor: (row) => {
            const {total, format} = row;
            return hammer.format[format](total);
        },
    },
    {
        name: 'usage',
        header: 'Usage',
        sortable: false,
        width: 100,
        accessor: (row) => {
            const {used, format} = row;
            return hammer.format[format](used);
        },
    },
    {
        name: 'free',
        header: 'Free',
        sortable: false,
        width: 100,
        accessor: (row) => {
            const {free, format} = row;
            return hammer.format[format](free);
        },
    },
];

function AccountStaticConfiguration({className}: Props) {
    const dispatch = useDispatch();

    const account = useSelector(getActiveAccount);
    const {collapsibleSize} = useSelector(getUISizes);
    const items = useSelector(getActiveAccountStaticConfiguration);
    const expandState = useSelector(getSettingsAccountsExpandStaticConfiguration);

    const onToggle = React.useCallback(
        (value: boolean) => {
            // It is required to enforce DataTable to redraw content
            window.dispatchEvent(new Event('resize'));
            dispatch(setSettingsAccountsExpandStaticConfiguration(!value));
        },
        [dispatch],
    );

    if (!account || !items?.length) {
        return null;
    }

    return (
        <CollapsibleSection
            name={'Static configuration'}
            className={block(null, className)}
            size={collapsibleSize}
            collapsed={!expandState}
            onToggle={onToggle}
        >
            <DataTableYT
                columns={columns}
                data={items}
                useThemeYT
                className={block('table')}
                settings={{
                    displayIndices: false,
                }}
                rowClassName={({level}) => {
                    return !level ? '' : block('row', {level: String(level)});
                }}
            />
        </CollapsibleSection>
    );
}

export default React.memo(AccountStaticConfiguration);
