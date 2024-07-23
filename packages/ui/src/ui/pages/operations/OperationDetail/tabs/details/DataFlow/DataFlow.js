import React from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import reduce_ from 'lodash/reduce';

import hammer from '../../../../../../common/hammer';
import ElementsTable from '../../../../../../components/ElementsTable/ElementsTable';

import {
    completedTableProps,
    intermediateTableProps,
} from '../../../../../../utils/operations/tabs/details/resources/resourcesTablesProps';
import {operationProps} from '../Runtime/Runtime';

import {hasProgressTasks} from '../../../../../../utils/operations/tabs/details/data-flow';

import './DataFlow.scss';
import ClickableAttributesButton from '../../../../../../components/AttributesButton/ClickableAttributesButton';
import ExpandIcon from '../../../../../../components/ExpandIcon/ExpandIcon';
const block = cn('resources');

export const resourcesProps = PropTypes.arrayOf(
    PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.object,
        from: PropTypes.string,
        to: PropTypes.string,
    }),
);
export const intermediateResourcesProps = PropTypes.array;

function resourceAsBytes(item, columnName) {
    return hammer.format['Bytes'](item.value[columnName]);
}

function resourceAsNumber(item, columnName) {
    return hammer.format['Number'](item.value[columnName]);
}

function expandKey(from, to) {
    return `${from}->${to}`;
}

function prepareState(allowExpand, resources, expandedTasks) {
    return {
        allowExpand,
        resources: !allowExpand
            ? resources
            : reduce_(
                  resources,
                  (acc, item) => {
                      const {from, to} = item;
                      const expanded = expandedTasks[expandKey(from, to)];
                      acc.push(item);
                      if (expanded) {
                          const {job_data_statistics, teleport_data_statistics} = item;
                          if (job_data_statistics) {
                              acc.push({
                                  inner: 'processed by jobs',
                                  value: job_data_statistics,
                              });
                          }
                          if (teleport_data_statistics) {
                              acc.push({
                                  inner: 'teleported',
                                  value: teleport_data_statistics,
                              });
                          }
                      }
                      return acc;
                  },
                  [],
              ),
    };
}

class DataFlow extends React.Component {
    static getDerivedStateFromProps(props, state) {
        if (props === state.prevProps) {
            return null;
        }

        const {operation, resources} = props;
        const allowExpand = hasProgressTasks(operation);
        return {
            allowExpand,
            ...prepareState(allowExpand, resources, state.expandedTasks),
        };
    }

    state = {
        prevProps: undefined,
        expandedTasks: {},

        resources: [],
        allowExpand: false,
    };

    toggleExpand(key) {
        const expandedTasks = {...this.state.expandedTasks};
        if (expandedTasks[key]) {
            delete expandedTasks[key];
        } else {
            expandedTasks[key] = true;
        }

        const {allowExpand} = this.state;
        const {resources} = this.props;
        this.setState({
            expandedTasks,
            ...prepareState(allowExpand, resources, expandedTasks),
        });
    }

    getResourceTemplates() {
        const {expandedTasks, allowExpand} = this.state;
        const self = this;
        return {
            name(item) {
                const {name, from, to, inner} = item;
                if (name) {
                    return name;
                }
                if (inner) {
                    return <span className={block('inner')}>{inner}</span>;
                }
                const fromTo = (
                    <span>
                        {from} -&gt; {to}
                    </span>
                );
                if (!allowExpand) {
                    return fromTo;
                } else {
                    const expKey = expandKey(from, to);
                    const expanded = expandedTasks[expKey];
                    const onClick = () => {
                        self.toggleExpand(expKey);
                    };
                    return (
                        <React.Fragment>
                            <ExpandIcon expanded={expanded} onClick={onClick} visible />
                            <span onClick={onClick} className={block('name')}>
                                {fromTo}
                            </span>
                        </React.Fragment>
                    );
                }
            },
            chunk_count(item, columnName) {
                return resourceAsNumber.call(this, item, columnName);
            },
            row_count: resourceAsNumber,
            data_weight: resourceAsBytes,
            compressed_data_size: resourceAsBytes,
            uncompressed_data_size: resourceAsBytes,
            actions({info, from, to}) {
                if (!info) {
                    return null;
                }
                return (
                    <ClickableAttributesButton
                        title={`Data flow: ${from} -> ${to}`}
                        attributes={info}
                    />
                );
            },
        };
    }

    rowClassName = (data) => {
        if (data.name) {
            return block('named-row');
        }
        return data.inner ? block('inner-row') : null;
    };

    render() {
        const {operation, intermediateResources} = this.props;
        const {resources, allowExpand} = this.state;
        return (
            <div className={block()}>
                <div className={block('table', 'elements-section')}>
                    <ElementsTable
                        {...completedTableProps}
                        columnsMode={allowExpand ? 'withActions' : undefined}
                        css={block()}
                        items={resources}
                        templates={this.getResourceTemplates()}
                        rowClassName={this.rowClassName}
                    />
                </div>

                {operation.isRunning() && intermediateResources && (
                    <div className={block('table', 'elements-section')}>
                        <div className="elements-heading elements-heading_size_s">Uncommitted</div>

                        <ElementsTable
                            {...intermediateTableProps}
                            css={block()}
                            items={intermediateResources}
                        />
                    </div>
                )}
            </div>
        );
    }
}

DataFlow.propTypes = {
    operation: operationProps.isRequired,
    resources: resourcesProps.isRequired,
    intermediateResources: intermediateResourcesProps,
};

export default DataFlow;
