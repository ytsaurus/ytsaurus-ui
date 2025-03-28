import {Icon, Spin} from '@gravity-ui/uikit';
import React from 'react';
import block from 'bem-cn-lite';
import hammer from '../../../common/hammer';
import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import {ProgressStatuses, QueryStatus} from '../module/api';
import CircleExclamationIcon from '@gravity-ui/icons/svgs/circle-exclamation.svg';
import CircleCheckIcon from '@gravity-ui/icons/svgs/circle-check.svg';
import CircleStopIcon from '@gravity-ui/icons/svgs/circle-stop.svg';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import './index.scss';

const b = block('query-status');

type Props = {
    status: QueryStatus;
    mode: 'icon' | 'text' | 'both';
    className?: string;
};

const STATUS_ICONS: Partial<Record<QueryStatus, SVGIconData>> = {
    [QueryStatus.DRAFT]: FileIcon,
    [QueryStatus.FAILED]: CircleExclamationIcon,
    [QueryStatus.ABORTED]: CircleStopIcon,
    [QueryStatus.COMPLETED]: CircleCheckIcon,
};

export function QueryStatusIcon({status, className}: {status: QueryStatus; className?: string}) {
    if (ProgressStatuses.includes(status)) {
        return <Spin size="xs" className={b('icon-container', className)} />;
    }

    const statusIcon = STATUS_ICONS[status];
    if (statusIcon) {
        return (
            <Icon
                className={b(
                    'icon-container',
                    {
                        [status.toLocaleLowerCase()]: true,
                    },
                    className,
                )}
                data={statusIcon}
                size={16}
            />
        );
    }
    return <>{status}</>;
}

export const QueryStatusView = ({mode, status, className}: Props) => {
    return (
        <div className={b(null, className)}>
            {(mode === 'icon' || mode === 'both') && <QueryStatusIcon status={status} />}
            {(mode === 'text' || mode === 'both') && hammer.format.Readable(status)}
        </div>
    );
};
