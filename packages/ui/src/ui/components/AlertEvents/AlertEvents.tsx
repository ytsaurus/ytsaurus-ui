import React from 'react';
import {Column} from '@gravity-ui/react-data-table';
import cn from 'bem-cn-lite';

import format from '../../common/hammer/format';
import DataTableYT from '../../components/DataTableYT/DataTableYT';
import {Template} from '../../components/MetaTable/templates/Template';

import {ClickableText} from '../../components/ClickableText/ClickableText';
import Icon from '../../components/Icon/Icon';
import Link from '../../components/Link/Link';
import {showErrorPopup} from '../../utils/utils';
import {compareWithUndefined} from '../../utils/sort-helpers';

import './AlertEvents.scss';

const block = cn('alert-events');

interface Props {
    className?: string;
    items: Array<AlertInfo>;
}

export interface AlertInfo {
    from?: string;
    to?: string;
    type: string;
    error: unknown;
    url?: string;
}

const columns: Array<Column<AlertInfo>> = [
    {
        name: 'Type',
        render({row}) {
            return (
                <span>
                    {format.Readable(row.type)}
                    {Boolean(row.url) && (
                        <Link url={row.url} theme={'secondary'}>
                            &nbsp;
                            <Icon awesome={'question-circle'} />
                        </Link>
                    )}
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
                <ClickableText
                    onClick={() => {
                        showErrorPopup(row.error as any, {
                            type: 'alert',
                            hideOopsMsg: true,
                            helpURL: row.url,
                        });
                    }}
                >
                    Details
                </ClickableText>
            );
        },
    },
];

const VISIBLE_COUNT = 5;

function AlertEvents({className, items}: Props) {
    const [allVisible, setAllVisible] = React.useState(false);
    const all = React.useMemo(() => {
        return items.sort((l, r) => {
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
        <div className={className}>
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
                <ClickableText onClick={toggleShowAll}>
                    {allVisible ? 'Less' : 'More'}
                </ClickableText>
            ) : null}
        </div>
    );
}

export default React.memo(AlertEvents);
