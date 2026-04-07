import React from 'react';
import block from 'bem-cn-lite';
import moment from 'moment';
import {Text} from '@gravity-ui/uikit';

// @ts-ignore
import hammer from '@ytsaurus/interface-helpers/lib/hammer';

import {SubjectCard} from '../../components/SubjectLink/SubjectLink';
import Icon from '../../components/Icon/Icon';
import {Linkify} from '../../components/Linkify/Linkify';
import i18n from './i18n';

import './MaintenanceInfo.scss';

const b = block('maintenance-info');

const enum MaintenanceType {
    ISSUE = 'issue',
    MAINTENANCE = 'maintenance',
}

type MaintenancePageEvent = {
    type: string;
    startTime: string;
    finishTime: string;
    severity: string;
    title: string;
    description: string;
    createdBy: string;
};

export function MaintenanceInfo({
    className,
    maintenancePageEvent,
    headerSize,
}: {
    maintenancePageEvent: MaintenancePageEvent;
    className?: string;
    headerSize: 'm' | 'l';
}) {
    const {severity, type, title, description, createdBy} = maintenancePageEvent;

    const header = React.useMemo(() => {
        switch (type) {
            case 'maintenance':
                return i18n('alert_maintenance-in-progress');
            case 'issue':
                return i18n('alert_cluster-problems');
            default:
                return i18n('alert_something-went-wrong');
        }
    }, [type]);

    return (
        <div className={className}>
            <Text className={b('title')} variant={headerSize === 'm' ? 'header-1' : 'header-2'}>
                {header}
            </Text>
            <div className={b('severity', {type: severity})}>
                <Icon awesome="exclamation-triangle" />
                <span>{hammer.format['Readable'](severity)}</span>
            </div>

            <h3 className={b('user-title')}>{title}</h3>

            <div className={b('user-description')}>
                <Linkify text={description} />
            </div>

            <MaintenanceTime maintenancePageEvent={maintenancePageEvent} />

            <SubjectCard className={b('author')} name={createdBy} />
        </div>
    );
}

function MaintenanceTime({
    maintenancePageEvent: {startTime, finishTime, type},
}: {
    maintenancePageEvent: MaintenancePageEvent;
}) {
    if (type === MaintenanceType.ISSUE || type === MaintenanceType.MAINTENANCE) {
        const finishTimeString = finishTime && moment(finishTime).format('D MMM YYYY H:mm');
        const startTimeString = moment(startTime).format('D MMM YYYY H:mm');

        return finishTimeString ? (
            <p className={b('time-line')}>
                <time>{startTimeString}</time>
                &mdash;
                <time>{finishTimeString}</time>
            </p>
        ) : (
            <p className={b('time-line')}>
                <time>{startTimeString}</time>
            </p>
        );
    }

    return null;
}
