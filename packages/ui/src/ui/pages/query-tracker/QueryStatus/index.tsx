import {Icon, Spin} from '@gravity-ui/uikit';
import React from 'react';
import block from 'bem-cn-lite';
import hammer from '../../../common/hammer';
import doneIcon from '../../../../../img/svg/icons/check-circle.svg';
import errorIcon from '../../../../../img/svg/icons/exclamation-circle.svg';
import abortedIcon from '../../../../../img/svg/icons/stop-circle.svg';
import draftIcon from '../../../../../img/svg/icons/file.svg';
import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import {ProgressStatuses, QueryStatus} from '../module/api';
import './index.scss';

const b = block('query-status');

type Props = {
    status: QueryStatus;
    mode: 'icon' | 'text' | 'both';
    className?: string;
};

const STATUS_ICONS: Partial<Record<QueryStatus, SVGIconData>> = {
    [QueryStatus.DRAFT]: draftIcon,
    [QueryStatus.FAILED]: errorIcon,
    [QueryStatus.ABORTED]: abortedIcon,
    [QueryStatus.COMPLETED]: doneIcon,
};

export function QueryStatusIcon({status, className}: {status: QueryStatus; className?: string}) {
    if (ProgressStatuses.includes(status)) {
        return <Spin size="s" className={b('icon-container', {loading: true}, className)} />;
    }
    if (STATUS_ICONS[status]) {
        return (
            <Icon
                className={b(
                    'icon-container',
                    {
                        [status.toLocaleLowerCase()]: true,
                    },
                    className,
                )}
                data={STATUS_ICONS[status]!}
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
