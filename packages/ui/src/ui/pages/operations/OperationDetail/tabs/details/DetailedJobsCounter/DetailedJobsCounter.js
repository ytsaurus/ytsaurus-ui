import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import {Flex} from '@gravity-ui/uikit';

import Modal from '../../../../../../components/Modal/Modal';
import Link from '../../../../../../components/Link/Link';

import withVisible from '../../../../../../hocs/withVisible';
import hammer from '../../../../../../common/hammer';

import UIFactory from '../../../../../../UIFactory';
import {JobCounters} from './JobCounters';

const block = cn('operation-jobs-detailed');

class DetailedJobsCounter extends Component {
    renderAborted(item) {
        const scheduledCounters = item.scheduled.counters;
        const scheduledTotal = {key: 'total', value: item.scheduled.total};
        const scheduledItems = [scheduledTotal, ...scheduledCounters];

        const nonScheduledCounters = item.nonScheduled.counters;
        const nonScheduledTotal = {
            key: 'total',
            value: item.nonScheduled.total,
        };
        const nonScheduledItems = [nonScheduledTotal, ...nonScheduledCounters];

        const helpUrl = UIFactory.docsUrls['operations:overview#aborted_jobs'];

        return (
            <JobCounters
                helpUrl={helpUrl}
                data={{Scheduled: scheduledItems, 'Non scheduled': nonScheduledItems}}
                allowHideEmpty
            />
        );
    }

    renderCompleted(item) {
        const nonInterruptedItems = [{key: 'total', value: item.nonInterrupted.total}];

        const interruptedCounters = item.interrupted.counters;
        const interruptedTotal = {
            key: 'total',
            value: item.interrupted.total,
        };
        const nonScheduledItems = [interruptedTotal, ...interruptedCounters];

        const helpUrl = UIFactory.docsUrls['operations:overview#completed_jobs'];

        return (
            <JobCounters
                helpUrl={helpUrl}
                data={{
                    'Non interrupted': nonInterruptedItems,
                    Interrupted: nonScheduledItems,
                }}
            />
        );
    }

    renderModalContent(type) {
        const {item} = this.props;

        return type === 'aborted'
            ? this.renderAborted(item.abortedStats)
            : this.renderCompleted(item.completedStats);
    }

    renderCount(type, primary, secondary) {
        return type === 'aborted' ? (
            <span>
                {hammer.format['Number'](primary)}
                &nbsp;({hammer.format['Number'](secondary)})
            </span>
        ) : (
            <span>{hammer.format['Number'](primary + secondary)}</span>
        );
    }

    render() {
        const {primaryValue, secondaryValue, handleClose, handleShow, visible, type, item} =
            this.props;

        const title = `${hammer.format['ReadableField'](type)} statistics: ${item.caption}`;
        const modalContent = this.renderModalContent(type);

        return (
            <Flex className={block()} gap={1}>
                <Link theme="ghost" size="xs" onClick={handleShow}>
                    View{' '}
                </Link>
                {this.renderCount(type, primaryValue, secondaryValue)}
                <Modal
                    onOutsideClick={handleClose}
                    onCancel={handleClose}
                    content={modalContent}
                    visible={visible}
                    footer={false}
                    title={title}
                />
            </Flex>
        );
    }
}

DetailedJobsCounter.propTypes = {
    primaryValue: PropTypes.number.isRequired,
    secondaryValue: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    handleShow: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['aborted', 'completed']),
    item: PropTypes.shape({
        caption: PropTypes.string.isRequired,
    }),
};

export default withVisible(DetailedJobsCounter);
