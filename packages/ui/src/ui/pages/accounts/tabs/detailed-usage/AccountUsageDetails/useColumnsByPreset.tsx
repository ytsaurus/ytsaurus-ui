import React, {useCallback, useMemo} from 'react';

import capitalize_ from 'lodash/capitalize';
import forEach_ from 'lodash/forEach';

import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {type Column} from '@gravity-ui/react-data-table';
import {Button, Flex, Icon as GravityIcon, Tooltip} from '@gravity-ui/uikit';
import {Warning} from '@ytsaurus/components';

import format from '../../../../../common/hammer/format';
import Icon from '../../../../../components/Icon/Icon';
import {SubjectCard} from '../../../../../components/SubjectLink/SubjectLink';
import {Page} from '../../../../../constants/index';
import PathView from '../../../../../containers/PathFragment/PathFragment';
import {
    openAccountAttributesModal,
    setAccountUsageDataFilter,
} from '../../../../../store/actions/accounts/account-usage';
import {makeRoutedURL} from '../../../../../store/location';
import {
    type AccountUsageDataItem,
    type AccountUsageMediumKey,
} from '../../../../../store/reducers/accounts/usage/account-usage-types';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectAccountUsageAvailableColumns,
    selectAccountUsageViewType,
    selectAccountUsageVisibleDataColumns,
} from '../../../../../store/selectors/accounts/account-usage';
import {selectCluster} from '../../../../../store/selectors/global';
import {getIconNameForType} from '../../../../../utils/navigation/path-editor';

import {assert} from '../../../../../../shared/utils/toolkit';
import {AccountActionsField, type AccountRequestData} from '../AccountActionsField';
import {useGetVersionedFieldValue} from './useGetVersionedFieldValue';
import {DetailTableCell} from '../DetailTableCell';
import i18n from '../i18n';

import {Header} from './Header';
import {PathHeader} from './PathHeader';
import {block, getIconNameForViewType} from './utils';

export const useColumnsByPreset = (mediums: AccountUsageMediumKey[]) => {
    const dispatch = useDispatch();

    const availableColumns = useSelector(selectAccountUsageAvailableColumns);
    const visibleColumns = useSelector(selectAccountUsageVisibleDataColumns);
    const cluster = useSelector(selectCluster);

    const viewType = useSelector(selectAccountUsageViewType);
    assert(viewType, 'viewType must be defined');

    const getVersionedFieldValue = useGetVersionedFieldValue();

    const handleAttributeButtonClick = useCallback(
        (accountData: AccountRequestData) => {
            dispatch(openAccountAttributesModal(accountData));
        },
        [dispatch],
    );

    const columnsByName = useMemo(() => {
        const res: Map<string, Column<AccountUsageDataItem>> = new Map();

        const iconName = getIconNameForViewType(viewType);

        res.set('type', {
            name: 'type',
            header: iconName ? <Icon awesome={iconName} /> : null,
            sortable: false,
            render(item) {
                const {type, path, acl_status} = item.row;

                return acl_status === 'deny' ? (
                    <Icon face="light" awesome="eye-slash" />
                ) : (
                    <Icon awesome={getIconNameForType(path ? type : '')} />
                );
            },
            width: 50,
        });
        res.set('path', {
            name: 'path',
            header: <PathHeader />,
            sortable: false,
            render(item) {
                const {path} = item.row;
                if (!path) {
                    return <Warning>{i18n('alert_permission-denied')}</Warning>;
                }

                const url = makeRoutedURL(`/${cluster}/${Page.NAVIGATION}?path=${path}`);

                return (
                    <Flex alignItems="center" gap={1}>
                        <span>
                            <PathView path={path} lastFragmentOnly={viewType === 'tree'} />
                        </span>
                        <Tooltip content={i18n('context_open-original-path')}>
                            <Button
                                className={block('link')}
                                href={url}
                                title={url}
                                view="flat"
                                target="_blank"
                                size="xs"
                            >
                                <GravityIcon data={ArrowUpRightFromSquareIcon} size="14" />
                            </Button>
                        </Tooltip>
                    </Flex>
                );
            },
            onClick: ({row}) => {
                const {path} = row;
                if (
                    !path ||
                    (viewType !== 'tree-diff' && viewType !== 'tree') ||
                    row.type !== 'map_node'
                ) {
                    return;
                }
                dispatch(setAccountUsageDataFilter({treePath: row.path}));
            },
            className: block('path-cell', {view: viewType}),
        });

        res.set('disk_space', {
            name: 'disk_space',
            header: <Header column={'disk_space'} />,
            sortable: false,
            render(item) {
                return (
                    <DetailTableCell
                        value={item.row.disk_space}
                        additionalValue={getVersionedFieldValue(item.row, 'disk_space')}
                        viewType={viewType}
                        formatType="bytes"
                    />
                );
            },
            align: 'right',
            width: 120,
        });

        res.set('master_memory', {
            name: 'Master mem',
            header: <Header column={'master_memory'} />,
            sortable: false,
            render(item) {
                return (
                    <DetailTableCell
                        value={item.row.master_memory}
                        additionalValue={getVersionedFieldValue(item.row, 'master_memory')}
                        viewType={viewType}
                        formatType="bytes"
                    />
                );
            },
            align: 'right',
            width: 120,
        });

        res.set('owner', {
            name: 'Owner',
            header: <Header column={'owner'} />,
            sortable: false,
            render(item) {
                return <SubjectCard name={item.row.owner} />;
            },
            width: 120,
        });

        forEach_(mediums, (medium) => {
            const name = `medium:${medium}` as const;

            res.set(name, {
                name,
                header: <Header column={name} />,
                sortable: false,
                render(item) {
                    return (
                        <DetailTableCell
                            value={Number(item.row[name])}
                            additionalValue={getVersionedFieldValue(item.row, name)}
                            viewType={viewType}
                            formatType="bytes"
                        />
                    );
                },
                align: 'right',
                width: 120,
            });
        });

        forEach_(availableColumns, (field) => {
            if (res.has(field)) {
                return;
            }

            res.set(field, {
                name: field,
                header: <Header column={field} />,
                sortable: false,
                render(item) {
                    const value = item.row[field];

                    if (typeof value === 'boolean') {
                        return capitalize_(String(value));
                    }
                    if (field.endsWith('_time')) {
                        return value === null || value === undefined
                            ? format.NO_VALUE
                            : format.DateTime(value, {format: 'full'});
                    }
                    if (field.endsWith('_count')) {
                        return (
                            <DetailTableCell
                                value={Number(value)}
                                additionalValue={getVersionedFieldValue(item.row, field)}
                                viewType={viewType}
                                formatType="number"
                            />
                        );
                    }
                },
                align: 'right',
                width: 150,
            });
        });

        return res;
    }, [viewType, mediums, cluster, availableColumns, getVersionedFieldValue, dispatch]);

    return useMemo(() => {
        const res: Array<Column<AccountUsageDataItem>> = [];
        visibleColumns.forEach((name) => {
            const item = columnsByName.get(name);
            if (item) {
                res.push(item);
            }
        });
        res.push({
            name: 'actions',
            header: '',
            sortable: false,
            render(item) {
                return (
                    <AccountActionsField
                        cluster={cluster}
                        row={item.row}
                        onAttributeButtonClick={handleAttributeButtonClick}
                    />
                );
            },
            width: 50,
        });

        return res;
    }, [handleAttributeButtonClick, cluster, columnsByName, visibleColumns]);
};
