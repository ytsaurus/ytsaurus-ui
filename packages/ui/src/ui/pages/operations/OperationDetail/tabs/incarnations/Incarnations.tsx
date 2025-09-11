import React from 'react';
import {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import {Alert, Card, Disclosure, Flex, Loader} from '@gravity-ui/uikit';

import type {YTError} from '../../../../../../@types/types';

import {getIncarnationsInfo} from '../../../../../store/selectors/operations/incarnations';
import type {Incarnations as YTIncarnations} from '../../../../../store/selectors/operations/incarnations';

import {YTErrorBlock} from '../../../../../components/Error/Error';

import {IncarnationMeta} from './IncarnationMeta';
import {IncarnationCardHeader} from './IncarnationCardHeader';
import {IncarnationsToolbar} from './IncarnationsToolbar';
import {IncarnationsCount} from './IncarnationsCount';
import {IncarnationInfoDialog} from './IncarnationInfoDialog';

import {incarnationCn, incarnationInfoCn} from './constants';

import './Incarnations.scss';

export type IncarnationProps = {
    incarnations: YTIncarnations;
    isLoading: boolean;
    error?: YTError | AxiosError;
    renderTelemetryInfo?: (incarnationId: string) => React.ReactNode;
    incarnationsCount?: React.ReactNode;
    incarnationsToolbar?: React.ReactNode;
    incarnationsAlert?: React.ReactNode;
};

export function Incarnations() {
    const {incarnations, error, isLoading} = useSelector(getIncarnationsInfo);

    return (
        <IncarnationsTemplate
            incarnations={incarnations}
            isLoading={isLoading}
            error={error}
            incarnationsCount={<IncarnationsCount />}
            incarnationsToolbar={<IncarnationsToolbar />}
        />
    );
}

export function IncarnationsTemplate(props: IncarnationProps) {
    const {
        incarnations,
        isLoading,
        error,
        incarnationsCount,
        incarnationsToolbar,
        incarnationsAlert,
        renderTelemetryInfo,
    } = props;

    if (isLoading) {
        return (
            <Flex justifyContent={'center'} alignItems={'center'}>
                <Loader />
            </Flex>
        );
    }

    if (error) {
        return <YTErrorBlock error={error as YTError | AxiosError} />;
    }

    return (
        <>
            <Flex direction={'column'} gap={2}>
                {incarnationsToolbar}
                {incarnationsCount}
                {incarnationsAlert}
                {incarnations?.length ? (
                    incarnations.map((incarnation) => (
                        <Card key={incarnation.id} view={'outlined'} className={incarnationCn}>
                            <Disclosure keepMounted={false}>
                                <IncarnationCardHeader incarnation={incarnation} />
                                <Flex direction={'row'} className={incarnationInfoCn}>
                                    <IncarnationMeta incarnation={incarnation} />
                                    {renderTelemetryInfo?.(incarnation.id)}
                                </Flex>
                            </Disclosure>
                        </Card>
                    ))
                ) : (
                    <Alert theme={'info'} message={'No incarnations to show'} />
                )}
            </Flex>
            <IncarnationInfoDialog />
        </>
    );
}
