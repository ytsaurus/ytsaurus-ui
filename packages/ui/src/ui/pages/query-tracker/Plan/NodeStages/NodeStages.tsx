import * as React from 'react';

import DataTable, {Column} from '@gravity-ui/react-data-table';
import {NodeState, NodeStages as Stages} from '../models/plan';
import cn from 'bem-cn-lite';

import {duration, isOperationFinished} from '../utils';

import '../NodeStages.scss';
import i18n from './i18n';

const block = cn('node-stages');

type StageRow = {stage: string; duration: string; footerIndex?: number};

const getStagesColumns = (): Column<StageRow>[] => [
    {name: 'stage', header: i18n('field_stage'), sortable: false},
    {
        name: 'duration',
        header: i18n('field_duration'),
        align: DataTable.RIGHT,
        sortable: false,
        width: 115,
    },
];

interface NodeStagesProps {
    stages?: Stages;
    state?: NodeState;
    startedAt?: string;
    finishedAt?: string;
}
export default function NodeStages({stages = {}, state, finishedAt}: NodeStagesProps) {
    const data = prepareData(stages, state, finishedAt);
    return (
        <div className={block()}>
            <DataTable
                theme="yandex-cloud"
                rowClassName={rowClassName}
                columns={getStagesColumns()}
                startIndex={1}
                data={data.slice(0, -1)}
                footerData={data.slice(-1)}
            />
        </div>
    );
}

function rowClassName(
    _row: StageRow,
    _index: number,
    isFooterData?: boolean,
    isHeaderData?: boolean,
) {
    if (isHeaderData) {
        return block('header');
    }
    if (isFooterData) {
        return block('footer');
    }

    return block('row');
}

function prepareData(data: Stages, state?: NodeState, finishedAt?: string) {
    const stages: StageRow[] = [];
    const length = Object.keys(data).length;

    if (!length) return stages;

    let [currentStage, currentTime] = Object.entries(data[0])[0];
    const startedTime = currentTime;
    for (let i = 1; i < length; i++) {
        const [nextStage, nextTime] = Object.entries(data[i])[0];
        stages.push({
            stage: currentStage,
            duration: duration(currentTime, nextTime),
        });
        currentStage = nextStage;
        currentTime = nextTime;
    }
    const finishTime = isOperationFinished(state) ? (finishedAt ?? currentTime) : undefined;
    stages.push({
        stage: currentStage,
        duration: duration(currentTime, finishTime),
    });
    stages.push({
        stage: i18n('value_total'),
        duration: duration(startedTime, finishTime),
        footerIndex: ' ' as any,
    });
    return stages;
}
