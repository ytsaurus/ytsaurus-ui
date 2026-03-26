import React from 'react';
import block from 'bem-cn-lite';

import {BlockNavigation} from '../../hocs/withBlockedNavigation';
import Button from '../../components/Button/Button';
import {uiSettings} from '../../config/ui-settings';

import {MaintenanceInfo} from './MaintenanceInfo';

import './MaintenancePage.scss';

const b = block('maintenance');

type Props = {
    cluster: string;
    onProceed?: () => void;
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
    render() {
        const {maintenancePageEvent, onProceed} = this.props;
        if (!maintenancePageEvent) {
            return null;
        }

        const {announcesMailListUrl} = uiSettings;

        return (
            <div className={b()}>
                <BlockNavigation />
                <div className={b('content')}>
                    <MaintenanceInfo
                        className={b('info')}
                        headerSize="l"
                        maintenancePageEvent={maintenancePageEvent}
                    />

                    {onProceed ? (
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
                    ) : null}
                </div>
            </div>
        );
    }
}

export {MaintenanceInfo} from './MaintenanceInfo';
