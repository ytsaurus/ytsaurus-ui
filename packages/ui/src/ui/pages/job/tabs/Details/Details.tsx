import React from 'react';
import cn from 'bem-cn-lite';

import includes_ from 'lodash/includes';

import {YTErrorBlock} from '../../../../components/Error/Error';
import PivotKeys from '../PivotKeys/PivotKeys';
import Speculative from '../Speculative/Speculative';
import StatisticsIO from '../StatisticsIO/StatisticsIO';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import Events from '../../../../pages/operations/OperationDetail/tabs/details/Events/Events';
import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';

import ypath from '../../../../common/thor/ypath';
import {RootState} from '../../../../store/reducers';
import {useSelector} from '../../../../store/redux-hooks';
import {JobError, JobEvents, JobStatistic} from '../../../../types/operations/job';

import './Details.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../../constants/global';

const block = cn('job-details');

function renderEvents(events: JobEvents, collapsibleSize: 'm' | 'ss') {
    return events ? (
        <CollapsibleSection name="Events" className={block('events')} size={collapsibleSize}>
            <Events events={events} type="phase" />
        </CollapsibleSection>
    ) : null;
}

function renderError(error: JobError) {
    return error ? (
        <div className={block('result')}>
            <YTErrorBlock error={error} />
        </div>
    ) : null;
}

function renderCompetitors(hasCompetitors: boolean, collapsibleSize: 'm' | 'ss') {
    return hasCompetitors ? (
        <CollapsibleSection
            collapsed
            name="Competitive jobs"
            className={block('speculative-jobs')}
            size={collapsibleSize}
        >
            <Speculative />
        </CollapsibleSection>
    ) : null;
}

function renderStatistics(statistics: JobStatistic, collapsibleSize: 'm' | 'ss') {
    // @ts-ignore
    const hasPipes = ypath.getValue(statistics, '/user_job/pipes');

    return hasPipes ? (
        <CollapsibleSection
            name="Statistics"
            className={block('statistics')}
            size={collapsibleSize}
        >
            <StatisticsIO />
        </CollapsibleSection>
    ) : null;
}

function renderPivotKeys(type: string | undefined, collapsibleSize: 'm' | 'ss') {
    const correctTypes = ['reduce', 'join_reduce', 'sorted_merge'];

    return includes_(correctTypes, type) ? (
        <CollapsibleSection
            collapsed
            name="Pivot keys"
            className={block('pivot-keys')}
            size={collapsibleSize}
        >
            <PivotKeys />
        </CollapsibleSection>
    ) : null;
}

export default function Details() {
    const {details, job} = useSelector((state: RootState) => state.job.general);
    const {events} = details;

    return (
        <ErrorBoundary>
            <div className={block()}>
                {events?.length! > 0 && (
                    <div className={block('section')}>
                        {renderEvents(details.events, UI_COLLAPSIBLE_SIZE)}
                    </div>
                )}

                <div className={block('section')}>
                    {renderError(job.attributes?.error)}
                    {renderStatistics(
                        job.attributes?.statistics as JobStatistic,
                        UI_COLLAPSIBLE_SIZE,
                    )}
                    {renderPivotKeys(job.attributes?.type, UI_COLLAPSIBLE_SIZE)}
                    {renderCompetitors(
                        Boolean(job.attributes?.has_competitors),
                        UI_COLLAPSIBLE_SIZE,
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}
