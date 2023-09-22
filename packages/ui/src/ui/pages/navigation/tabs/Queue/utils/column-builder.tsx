import React from 'react';
import moment from 'moment';
import type {Column} from '@gravity-ui/react-data-table';

import format from '../../../../../common/hammer/format';
import Label from '../../../../../components/Label/Label';
import Link from '../../../../../components/Link/Link';
import Multimeter from '../../../../../components/Multimeter/Multimeter';
import {UserCard} from '../../../../../components/UserLink/UserLink';
import WarningIcon from '../../../../../components/WarningIcon/WarningIcon';
import type {TPerformanceCounters} from '../../../../../store/reducers/navigation/tabs/queue/types';
import {Host} from '../../../../../containers/Host/Host';
import type {FIX_MY_TYPE, YTError} from '../../../../../types';
import {genNavigationUrl} from '../../../../../utils/navigation/navigation';

const DISPLAY_FORMAT = 'DD-MM-YYYY HH:mm:ss';

export function bool<T>(name: string, getter: (row: T) => boolean): Column<T> {
    return {
        name,
        render({row}) {
            return <Label theme="default" text={getter(row) ? 'True' : 'False'} />;
        },
        sortAccessor: getter,
    };
}

export function datetime<T>(name: string, getter: (row: T) => string | null): Column<T> {
    return {
        name,
        render({row}) {
            return moment(getter(row)).format(DISPLAY_FORMAT);
        },
        sortAccessor(row) {
            return moment(getter(row)).valueOf();
        },
    };
}

export function error<T>(name: string, getter: (row: T) => YTError | undefined): Column<T> {
    return {
        name,
        render({row}) {
            const error = getter(row);
            if (!error) return null;

            return <WarningIcon hoverContent={error as FIX_MY_TYPE} />;
        },
        sortAccessor: getter,
    };
}

export function host<T>(name: string, getter: (row: T) => string, classNames: string): Column<T> {
    return {
        name,
        render({row}) {
            const host = getter(row);
            return <Host asTabletNode address={host} copyBtnClassName={classNames} />;
        },
        sortAccessor: getter,
    };
}

export function multimeter<T>(
    name: string,
    getter: (row: T) => TPerformanceCounters,
    show: keyof TPerformanceCounters,
    valueFormat: (value: number) => React.ReactNode = format.Number,
): Column<T> {
    return {
        name,
        render({row}) {
            const counters = getter(row);
            return <Multimeter {...counters} show={show} format={valueFormat} />;
        },
        sortAccessor(row) {
            const counters = getter(row);
            return counters['1m'];
        },
    };
}

export function number<T>(name: string, getter: (row: T) => number | null): Column<T> {
    return {
        name,
        align: 'right',
        render({row}) {
            return format.Number(getter(row));
        },
        sortAccessor: getter,
    };
}

export function string<T>(name: string, getter: (row: T) => string): Column<T> {
    return {
        name,
        render({row}) {
            return getter(row);
        },
        sortAccessor: getter,
    };
}

export function user<T>(name: string, getter: (row: T) => string): Column<T> {
    return {
        name,
        render({row}) {
            return <UserCard userName={getter(row)} />;
        },
        sortAccessor: getter,
    };
}

export function ypath<T>(name: string, getter: (row: T) => string): Column<T> {
    return {
        name,
        render({row}) {
            const consumer = getter(row);
            if (!consumer) return null;

            const [cluster, path] = consumer.split(':');
            const url = genNavigationUrl(cluster, path);

            return (
                <Link url={url} routed>
                    {consumer}
                </Link>
            );
        },
        sortAccessor: getter,
    };
}
