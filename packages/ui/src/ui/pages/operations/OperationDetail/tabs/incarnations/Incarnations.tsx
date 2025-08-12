import React from 'react';
import {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import {Alert, Card, Disclosure, Flex, Loader} from '@gravity-ui/uikit';

import {getOperation} from '../../../../../store/selectors/operations/operation';
import {getIncarnationsInfo} from '../../../../../store/selectors/operations/incarnations';
import {RootState} from '../../../../../store/reducers';

import {YTErrorBlock} from '../../../../../components/Error/Error';

import UIFactory from '../../../../../UIFactory';

import {IncarnationMeta} from './IncarnationMeta';
import {IncarnationCardHeader} from './IncarnationCardHeader';
import {IncarnationsToolbar} from './IncarnationsToolbar';
import {IncarnationsCount} from './IncarnationsCount';
import {IncarnationInfoDialog} from './IncarnationInfoDialog';

import {incarnationCn, incarnationInfoCn} from './constants';

import './Incarnations.scss';

export function Incarnations() {
    const operation = useSelector(getOperation);

    const {incarnations, error, isLoading} = useSelector((state: RootState) =>
        getIncarnationsInfo(state, {operation_id: operation.id, event_type: 'incarnation_started'}),
    );

    const telemetrySetup = UIFactory.IncarnationsTelemetrySetup;

    if (error) {
        return <YTErrorBlock error={error as AxiosError} />;
    }

    return (
        <>
            {isLoading ? (
                <Flex justifyContent={'center'} alignItems={'center'}>
                    <Loader />
                </Flex>
            ) : (
                <Flex direction={'column'} gap={2}>
                    <IncarnationsToolbar />
                    <IncarnationsCount />
                    {incarnations?.length ? (
                        incarnations.map((incarnation) => (
                            <Card key={incarnation.id} view={'outlined'} className={incarnationCn}>
                                <Disclosure>
                                    <IncarnationCardHeader incarnation={incarnation} />
                                    <Flex direction={'row'} className={incarnationInfoCn}>
                                        <IncarnationMeta incarnation={incarnation} />
                                        {telemetrySetup?.hasTelemtery(operation) &&
                                            telemetrySetup?.renderInfo({
                                                incarnationId: incarnation.id,
                                            })}
                                    </Flex>
                                </Disclosure>
                            </Card>
                        ))
                    ) : (
                        <Alert theme={'info'} message={'No incarnations to show'} />
                    )}
                </Flex>
            )}
            <IncarnationInfoDialog />
        </>
    );
}
