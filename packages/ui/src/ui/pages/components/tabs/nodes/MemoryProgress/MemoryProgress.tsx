import React from 'react';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {Progress} from '@gravity-ui/uikit';

import hammer from '../../../../../common/hammer';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';

import './MemoryProgress.scss';

const block = cn('nodes-memory');

type MemoryProgressProps = {
    // from parent
    memoryText: string;
    memoryData?: Array<MemoryData>;
};

type MemoryData = {
    color: string;
    name: string;
    value: number;
    rawData?: {used?: number; limit?: number};
};

export default class MemoryProgress extends React.Component<MemoryProgressProps> {
    progress = React.createRef();

    renderProgress() {
        const {memoryText, memoryData = []} = this.props;

        return <Progress stack={memoryData} text={memoryText} />;
    }

    renderItem(item: MemoryData) {
        const rawDataUsed = item.rawData?.used;
        const rawDataLimit = item.rawData?.limit;
        const rawDataLimitIsNumber = typeof rawDataLimit === 'number';

        return (
            <li key={item.name} className={block('category')}>
                <div className={block('category-legend')}>
                    <div
                        className={block('category-legend-color')}
                        style={{backgroundColor: item.color}}
                    />
                    <strong className={block('category-legend-title')}>
                        {hammer.format['ReadableField'](item.name)}
                    </strong>
                </div>
                <div className={block('category-data')}>
                    <span>{hammer.format['Bytes'](rawDataUsed)}</span>
                    {rawDataLimitIsNumber && ' / '}
                    {rawDataLimitIsNumber && <span>{hammer.format['Bytes'](rawDataLimit)}</span>}
                </div>
            </li>
        );
    }

    renderPopupContent() {
        const {memoryData} = this.props;

        return (
            memoryData?.length! > 0 && (
                <div className={block('popup')}>
                    <ul className={block('content')}>
                        {map_(memoryData, (item) => this.renderItem(item))}
                    </ul>
                </div>
            )
        );
    }

    render() {
        return (
            <Tooltip className={block()} content={this.renderPopupContent()}>
                <div>{this.renderProgress()}</div>
            </Tooltip>
        );
    }
}
