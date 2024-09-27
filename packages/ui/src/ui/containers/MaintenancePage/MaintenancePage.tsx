import React from 'react';
import block from 'bem-cn-lite';
import moment from 'moment';

// @ts-ignore
import hammer from '@ytsaurus/interface-helpers/lib/hammer';

import {SubjectCard} from '../../components/SubjectLink/SubjectLink';
import {BlockNavigation} from '../../hocs/withBlockedNavigation';
import Icon from '../../components/Icon/Icon';
import Button from '../../components/Button/Button';
import {Linkify} from '../../components/Linkify/Linkify';
import {uiSettings} from '../../config/ui-settings';

import './MaintenancePage.scss';

const b = block('maintenance');

const EVENT_TYPE = {
    ISSUE: 'issue',
    MAINTENANCE: 'maintenance',
};

type Props = {
    cluster: string;
    onProceed: () => void;
    maintenancePageEvent: {
        type: string;
        startTime: string;
        finishTime: string;
        severity: string;
        title: string;
        description: string;
        createdBy: string;
    };
};

export class MaintenancePage extends React.Component<Props> {
    get title() {
        const {type} = this.props.maintenancePageEvent;

        switch (type) {
            case 'maintenance':
                return 'Maintenance is under way';
            case 'issue':
                return 'Cluster experiences problems';
            default:
                return 'Oops! Something went wrong';
        }
    }

    renderTimeLine(notification: Props['maintenancePageEvent']) {
        const {startTime, finishTime} = notification;

        if ([EVENT_TYPE.ISSUE, EVENT_TYPE.MAINTENANCE].indexOf(notification.type) > -1) {
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

    render() {
        const {maintenancePageEvent, onProceed} = this.props;
        if (!maintenancePageEvent) {
            return null;
        }

        const {severity, title, description, createdBy} = maintenancePageEvent;

        const {announcesMailListUrl} = uiSettings;

        return (
            <div className={b()}>
                <BlockNavigation />
                <div className={b('content')}>
                    <div className={b('info')}>
                        <h2 className={b('title')}>{this.title}</h2>

                        <div className={b('severity', {type: severity})}>
                            <Icon awesome="exclamation-triangle" />
                            <span>{hammer.format['Readable'](severity)}</span>
                        </div>

                        <h3 className={b('user-title')}>{title}</h3>

                        <div className={b('user-description')}>
                            <Linkify text={description} />
                        </div>

                        {this.renderTimeLine(maintenancePageEvent)}

                        <SubjectCard className={b('author')} name={createdBy} />

                        <ul className={b('links')}>
                            {announcesMailListUrl && (
                                <li className={b('link')}>
                                    <Button
                                        href={announcesMailListUrl}
                                        target="_blank"
                                        view="action"
                                        size="m"
                                    >
                                        Subscribe to YT announces
                                    </Button>
                                </li>
                            )}

                            <li className={b('link')}>
                                <Button size="m" onClick={onProceed}>
                                    Proceed to cluster anyway
                                </Button>
                            </li>
                        </ul>
                    </div>

                    <div className={b('illustration')}></div>
                </div>
            </div>
        );
    }
}
