import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import Error from '../../../../components/Error/Error';
import PivotKeys from '../PivotKeys/PivotKeys';
import Speculative from '../Speculative/Speculative';
import StatisticsIO from '../StatisticsIO/StatisticsIO';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import Events from '../../../../pages/operations/OperationDetail/tabs/details/Events/Events';
import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';

import ypath from '../../../../common/thor/ypath';
import {RootState} from '../../../../store/reducers';
import {useSelector} from 'react-redux';
import {JobEvents, JobError, JobStatistic} from '../../../../types/job';

import './Details.scss';
import {getUISizes} from '../../../../store/selectors/global';

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
            <Error error={error} />
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

    return _.includes(correctTypes, type) ? (
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
    const {collapsibleSize} = useSelector(getUISizes);

    return (
        <ErrorBoundary>
            <div className={block()}>
                {events?.length! > 0 && (
                    <div className={block('section')}>
                        {renderEvents(details.events, collapsibleSize)}
                    </div>
                )}

                <div className={block('section')}>
                    {renderError(job.error)}
                    {renderStatistics(job.statistics as JobStatistic, collapsibleSize)}
                    {renderPivotKeys(job.type, collapsibleSize)}
                    {renderCompetitors(Boolean(job.hasCompetitors), collapsibleSize)}
                </div>
            </div>
        </ErrorBoundary>
    );
}
