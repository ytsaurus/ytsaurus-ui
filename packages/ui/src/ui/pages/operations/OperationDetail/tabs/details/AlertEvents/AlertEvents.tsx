import React from 'react';
import {Column} from '@yandex-cloud/react-data-table';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import format from '../../../../../../common/hammer/format';
import ypath from '../../../../../../common/thor/ypath';
import DataTableYT from '../../../../../../components/DataTableYT/DataTableYT';
import {Template} from '../../../../../../components/MetaTable/templates/Template';

import Link from '../../../../../../components/Link/Link';
import {showErrorPopup} from '../../../../../../utils/utils';
import {prepareFaqUrl} from '../../../../../../utils/operations/tabs/details/alerts';
import {compareWithUndefined} from '../../../../../../utils/sort-helpers';

import './AlertEvents.scss';
import Icon from '../../../../../../components/Icon/Icon';

const block = cn('alert-events');

interface Props {
    items: Array<AlertEvent>;
}

interface AlertEvent {
    time: unknown;
    alert_type: unknown;
    error: unknown;
}

interface AlertInfo {
    from?: string;
    to?: string;
    type: string;
    error: unknown;
    url: string;
}

const columns: Array<Column<AlertInfo>> = [
    {
        name: 'Type',
        render({row}) {
            return (
                <span>
                    {format.Readable(row.type)}
                    <Link url={row.url} theme={'secondary'}>
                        &nbsp;
                        <Icon awesome={'question-circle'} />
                    </Link>
                </span>
            );
        },
    },
    {
        name: 'Period',
        render({row}) {
            const {from, to} = row;
            return (
                <React.Fragment>
                    <Template.Time
                        time={from}
                        settings={{format: 'full'}}
                        valueFormat={'DateTime'}
                    />
                    {' - '}
                    {!to ? (
                        '...'
                    ) : (
                        <Template.Time
                            time={to}
                            settings={{format: 'full'}}
                            valueFormat={'DateTime'}
                        />
                    )}
                </React.Fragment>
            );
        },
    },
    {
        name: '',
        render({row}) {
            return (
                <Link
                    onClick={() => {
                        showErrorPopup(row.error as any, {
                            type: 'alert',
                            hideOopsMsg: true,
                            helpURL: row.url,
                        });
                    }}
                >
                    Details
                </Link>
            );
        },
    },
];

const VISIBLE_COUNT = 5;

function AlertEvents({items}: Props) {
    const [allVisible, setAllVisible] = React.useState(false);
    const all = React.useMemo(() => {
        const appeared: Record<string, AlertInfo> = {};
        const res: Array<AlertInfo> = _.reduce(
            items,
            (acc, item) => {
                const type = ypath.getValue(item.alert_type);
                const code = ypath.getNumber(item, '/error/code', NaN);
                if (!code && appeared[type]) {
                    const last = appeared[type];
                    last.to = ypath.getValue(item.time);
                    delete appeared[type];
                } else if (code) {
                    acc.push({
                        from: ypath.getValue(item.time),
                        type,
                        error: item.error,
                        url: prepareFaqUrl(type),
                    });
                    appeared[type] = acc[acc.length - 1];
                } else {
                    acc.push({
                        to: ypath.getValue(item.time),
                        type,
                        error: item.error,
                        url: prepareFaqUrl(type),
                    });
                }
                return acc;
            },
            [] as Array<AlertInfo>,
        );

        return res.sort((l, r) => {
            return (
                compareWithUndefined(l.to, r.to, -1, -1) ||
                compareWithUndefined(l.from, r.from, -1, 1)
            );
        });
    }, [items]);

    const data = React.useMemo(() => {
        return allVisible ? all : all.slice(0, VISIBLE_COUNT);
    }, [allVisible, all]);

    const toggleShowAll = React.useCallback(() => {
        setAllVisible(!allVisible);
    }, [allVisible, setAllVisible]);

    return (
        <div>
            <DataTableYT
                className={block()}
                columns={columns}
                data={data}
                settings={{displayIndices: false, sortable: false}}
                useThemeYT
                disableRightGap
                rowClassName={(row) => {
                    return block('row', {current: !row.to});
                }}
            />
            {all.length > VISIBLE_COUNT ? (
                <Link onClick={toggleShowAll}>{allVisible ? 'Less' : 'More'}</Link>
            ) : null}
        </div>
    );
}

export default React.memo(AlertEvents);
