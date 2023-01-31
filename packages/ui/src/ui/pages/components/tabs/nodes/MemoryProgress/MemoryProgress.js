import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Progress} from '@gravity-ui/uikit';

import withVisible from '../../../../../hocs/withVisible';
import hammer from '../../../../../common/hammer';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';

import './MemoryProgress.scss';

const block = cn('nodes-memory');

class MemoryProgress extends Component {
    static propTypes = {
        // from parent
        memoryText: PropTypes.string.isRequired,
        memoryData: PropTypes.arrayOf(
            PropTypes.shape({
                color: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                value: PropTypes.number.isRequired,
                rawData: PropTypes.shape({
                    limit: PropTypes.number,
                    used: PropTypes.number,
                }),
            }),
        ).isRequired,
    };

    progress = React.createRef();

    renderProgress() {
        const {memoryText, memoryData} = this.props;

        return <Progress stack={memoryData} text={memoryText} />;
    }

    renderItem(category) {
        const rawDataUsed = category.rawData?.used;
        const rawDataLimit = category.rawData?.limit;
        const rawDataLimitIsNumber = typeof rawDataLimit === 'number';

        return (
            <li key={category.name} className={block('category')}>
                <div className={block('category-legend')}>
                    <div
                        className={block('category-legend-color')}
                        style={{backgroundColor: category.color}}
                    />
                    <strong className={block('category-legend-title')}>
                        {hammer.format['ReadableField'](category.name)}
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
            memoryData.length > 0 && (
                <div className={block('popup')}>
                    <ul className={block('content')}>
                        {_.map(memoryData, (category) => this.renderItem(category))}
                    </ul>
                </div>
            )
        );
    }

    render() {
        return (
            <Tooltip className={block()} content={this.renderPopupContent()} disableInline>
                <div>{this.renderProgress()}</div>
            </Tooltip>
        );
    }
}

export default withVisible(MemoryProgress);
