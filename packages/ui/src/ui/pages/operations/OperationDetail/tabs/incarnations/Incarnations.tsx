import React from 'react';
import {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import b from 'bem-cn-lite';
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

import i18n from './i18n';

import './Incarnations.scss';

const block = b('incarnations');

export type IncarnationProps = {
    incarnations: YTIncarnations;
    isLoading: boolean;
    error?: YTError | AxiosError;
    renderTelemetryInfo?: (incarnationId: string) => React.ReactNode;
    incarnationsCount?: React.ReactNode;
    incarnationsToolbar?: React.ReactNode;
    incarnationsAlert?: React.ReactNode;
};

export default function Incarnations() {
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

    if (error) {
        return <YTErrorBlock error={error as YTError | AxiosError} />;
    }

    return (
        <>
            <Flex direction={'column'} gap={2}>
                {incarnationsToolbar}
                {incarnationsCount}
                {isLoading ? (
                    <Flex justifyContent={'center'} alignItems={'center'}>
                        <Loader />
                    </Flex>
                ) : (
                    <>
                        {' '}
                        {incarnationsAlert}
                        {incarnations?.length ? (
                            incarnations.map((incarnation) => (
                                <Card
                                    key={incarnation.id}
                                    view={'outlined'}
                                    className={block('incarnation')}
                                >
                                    <Disclosure keepMounted={false}>
                                        <Disclosure.Summary>
                                            {(summaryProps) => (
                                                <IncarnationCardHeader
                                                    incarnation={incarnation}
                                                    {...summaryProps}
                                                />
                                            )}
                                        </Disclosure.Summary>
                                        <Flex
                                            direction={'row'}
                                            className={block('incarnation-info')}
                                        >
                                            <IncarnationMeta incarnation={incarnation} />
                                            {renderTelemetryInfo?.(incarnation.id)}
                                        </Flex>
                                    </Disclosure>
                                </Card>
                            ))
                        ) : (
                            <Alert theme={'info'} message={i18n('alert_no-incarnations')} />
                        )}
                    </>
                )}
            </Flex>
            <IncarnationInfoDialog />
        </>
    );
}
