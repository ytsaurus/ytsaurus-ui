import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import {compose} from 'redux';
import _ from 'lodash';
import ClickableAttributesButton from '../../../../../../components/AttributesButton/ClickableAttributesButton';

import ElementsTableBase from '../../../../../../components/ElementsTable/ElementsTable';
import withStickyFooter from '../../../../../../components/ElementsTable/hocs/withStickyFooter';
import withStickyHead from '../../../../../../components/ElementsTable/hocs/withStickyHead';
import {Progress} from '@gravity-ui/uikit';
import {Template} from '../../../../../../components/MetaTable/templates/Template';
import {Event} from '../../../../../../utils/operations/tabs/details/events/events';

import hammer from '../../../../../../common/hammer';
import {
    columns,
    getEventsTableProps,
} from '../../../../../../utils/operations/tabs/details/events/eventsTablesProps';

import './Events.scss';

export const eventsProps = PropTypes.array;
const block = cn('events');

const odBlock = cn('operation-detail');

const ElementsTable = compose(withStickyHead, withStickyFooter)(ElementsTableBase);

function getValue(event, columnName) {
    return columns[columnName]?.get(event);
}

export default class Events extends React.Component {
    static propTypes = {
        events: eventsProps,
        type: PropTypes.string,
    };

    static defaultProps = {
        type: 'state',
    };

    get templates() {
        return {
            start_time(event, columnName) {
                const value = getValue(event, columnName);
                return value ? (
                    <Template.Time
                        time={value}
                        settings={{format: 'full'}}
                        valueFormat={'DateTime'}
                    />
                ) : null;
            },
            finish_time(event, columnName) {
                const value = getValue(event, columnName);
                return value ? (
                    <Template.Time
                        time={value}
                        settings={{format: 'full'}}
                        valueFormat={'DateTime'}
                    />
                ) : null;
            },
            duration(item, columnName) {
                if (Event.isFinalState(item)) {
                    return hammer.format.NO_VALUE;
                }
                const value = getValue(item, columnName);
                return (
                    <Template.Time
                        time={value}
                        settings={{format: 'milliseconds'}}
                        valueFormat={'TimeDuration'}
                    />
                );
            },
            progress(item, columnName) {
                if (Event.isNotFinalState(item) && item.state !== 'total') {
                    const progress = item.progress.duration;
                    const {theme, value} = getValue(item, columnName);

                    return (
                        <div className={odBlock('events-progress', {theme})}>
                            <span
                                className={odBlock(
                                    'events-progress-percentage',
                                    'elements-secondary-text',
                                )}
                            >
                                {hammer.format['Percent'](progress)}
                            </span>
                            <Progress value={value} size="xs" />
                        </div>
                    );
                }
            },
            state(event, columnName) {
                const value = getValue(event, columnName);
                return <Template.Readable value={value} />;
            },
            phase(event, columnName) {
                const value = getValue(event, columnName);
                return <Template.Readable value={value} />;
            },
            actions: (event) => {
                const {attributes} = event || {};
                if (_.isEmpty(attributes)) {
                    return null;
                }
                return (
                    <ClickableAttributesButton
                        title={'Event attributes'}
                        attributes={event.attributes}
                    />
                );
            },
        };
    }

    render() {
        const {events, type} = this.props;
        const eventsItems = events.slice();
        const totalRow = eventsItems.pop();
        const {showAttributesColumn} = totalRow;

        return (
            <div className={block()}>
                <ElementsTable
                    {...getEventsTableProps(showAttributesColumn, type)}
                    items={eventsItems}
                    css={block()}
                    footer={totalRow}
                    templates={this.templates}
                />
            </div>
        );
    }
}
