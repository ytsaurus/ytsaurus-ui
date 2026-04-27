import React from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    type AccountStaticConfigurationItem,
    selectActiveAccount,
    selectActiveAccountStaticConfiguration,
} from '../../../../../store/selectors/accounts/accounts-ts';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import {DataTableYT} from '../../../../../components/DataTableYT';
import {type Column} from '@gravity-ui/react-data-table';
import hammer from '../../../../../common/hammer';
import {setSettingsAccountsExpandStaticConfiguration} from '../../../../../store/actions/settings/settings';

import './AccountStaticConfiguration.scss';
import {getSettingsAccountsExpandStaticConfiguration} from '../../../../../store/selectors/settings/settings-ts';
import {UI_COLLAPSIBLE_SIZE} from '../../../../../constants/global';
import i18n from './i18n';

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
        get header() {
            return i18n('field_limit');
        },
        sortable: false,
        width: 100,
        accessor: (row) => {
            const {total, format} = row;
            return hammer.format[format](total);
        },
    },
    {
        name: 'usage',
        get header() {
            return i18n('field_usage');
        },
        sortable: false,
        width: 100,
        accessor: (row) => {
            const {used, format} = row;
            return hammer.format[format](used);
        },
    },
    {
        name: 'free',
        get header() {
            return i18n('field_free');
        },
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

    const account = useSelector(selectActiveAccount);
    const items = useSelector(selectActiveAccountStaticConfiguration);
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
            name={i18n('title_static-configuration')}
            className={block(null, className)}
            size={UI_COLLAPSIBLE_SIZE}
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
