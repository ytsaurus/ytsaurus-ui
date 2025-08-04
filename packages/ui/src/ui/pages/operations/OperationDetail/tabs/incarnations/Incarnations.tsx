import React from 'react';
import {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import {Alert, Card, Disclosure, Flex, Loader, Text} from '@gravity-ui/uikit';

// import ypath from '../../../../../common/thor/ypath';

import {getIncarnationsInfo} from '../../../../../store/selectors/operations/incarnations';
import {RootState} from '../../../../../store/reducers';

import {YTErrorBlock} from '../../../../../components/Error/Error';
import {IncarnationMeta} from './IncarnationMeta';
import {IncarnationCardHeader} from './IncarnationCardHeader';
import {IncarnationsToolbar} from './IncarnationsToolbar';
import {IncarnationsCount} from './IncarnationsCount';
// import {FailReasons} from './FailReasons';

import {incarnationCn, incarnationInfoCn} from './constants';

import './Incarnations.scss';

type Props = {
    operationId: string;
};

export function Incarnations({operationId}: Props) {
    const {incarnations, error, isLoading} = useSelector((state: RootState) =>
        getIncarnationsInfo(state, {operation_id: operationId, event_type: 'incarnation_started'}),
    );

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
                    <IncarnationsCount operationId={operationId} />
                    {incarnations?.length ? (
                        incarnations.map((incarnation) => (
                            <Card key={incarnation.id} view={'outlined'} className={incarnationCn}>
                                <Disclosure>
                                    <IncarnationCardHeader incarnation={incarnation} />
                                    <Flex
                                        direction={'row'}
                                        justifyContent={'space-between'}
                                        className={incarnationInfoCn}
                                    >
                                        <IncarnationMeta incarnation={incarnation} />
                                        {/* <FailReasons operation={operation} /> */}
                                    </Flex>
                                </Disclosure>
                            </Card>
                        ))
                    ) : (
                        <Alert theme={'info'} message={'No incarnations to show'} />
                    )}
                </Flex>
            )}
        </>
    );
}
