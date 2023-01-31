import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import MetaTable from '../../../../../../components/MetaTable/MetaTable';
import Modal from '../../../../../../components/Modal/Modal';
import Link from '../../../../../../components/Link/Link';
import Icon from '../../../../../../components/Icon/Icon';

import withVisible from '../../../../../../hocs/withVisible';
import hammer from '../../../../../../common/hammer';

import {docsUrl} from '../../../../../../config';

import './DetailedJobsCounter.scss';
import UIFactory from '../../../../../../UIFactory';

const block = cn('operation-jobs-detailed');

class DetailedJobsCounter extends Component {
    renderSection(name, items) {
        return (
            <div className="elements-section">
                <div className="elements-heading elements-heading_size_s">{name}</div>

                <MetaTable items={items} />
            </div>
        );
    }

    renderHelpLink(helpUrl) {
        return docsUrl(
            <div className="elements-section">
                <Link url={helpUrl}>
                    <Icon awesome="book" /> Help
                </Link>
            </div>,
        );
    }

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
            <div className="pretty-scroll">
                {this.renderSection('Scheduled', scheduledItems)}

                {this.renderSection('Non scheduled', nonScheduledItems)}

                {this.renderHelpLink(helpUrl)}
            </div>
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
            <div className="pretty-scroll">
                {this.renderSection('Non interrupted', nonInterruptedItems)}

                {this.renderSection('Interrupted', nonScheduledItems)}

                {this.renderHelpLink(helpUrl)}
            </div>
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
                &nbsp; ({hammer.format['Number'](secondary)})
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
            <div className={block()}>
                <Link theme="ghost" size="xs" onClick={handleShow}>
                    View
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
            </div>
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
