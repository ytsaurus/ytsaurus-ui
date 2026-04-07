import React from 'react';

import format from '../../common/hammer/format';
import {MaintenanceRequestInfo} from '../../store/actions/components/node-maintenance-modal';
import {SubjectCard} from '../../components/SubjectLink/SubjectLink';

import {Bold, WarningLight} from '@ytsaurus/components';
import Label from '../../components/Label';
import i18n from './i18n';

export type MaintenanceRequestsProps = {
    requests?: Record<string, MaintenanceRequestInfo>;
};

function MaintenanceRequestsImpl({requests = {}}: MaintenanceRequestsProps) {
    return Object.keys(requests).map((key) => {
        const {type, user, comment} = requests[key];
        return (
            <div key={key}>
                <Bold>
                    <Label theme="danger" type="text" text={format.ReadableField(type)} />
                </Bold>
                {i18n('context_by')}
                <Bold>
                    <SubjectCard type="user" name={user} />
                    {': '}
                    <WarningLight>{comment}</WarningLight>
                </Bold>
            </div>
        );
    });
}

export const MaintenanceRequests = React.memo(MaintenanceRequestsImpl);
