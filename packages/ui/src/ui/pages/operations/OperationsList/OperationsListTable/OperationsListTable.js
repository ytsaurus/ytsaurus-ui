import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../../../common/hammer';
import cn from 'bem-cn-lite';
import _, {trimEnd} from 'lodash';

import unipika from '../../../../common/thor/unipika';
import OperationProgress from '../../../../pages/operations/OperationProgress/OperationProgress';
import {TemplatePools, TemplateWeight} from '../../../../components/MetaTable/MetaTable';
import templates, {renderText} from '../../../../components/templates/utils';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import {UserCard} from '../../../../components/UserLink/UserLink';
import Button from '../../../../components/Button/Button';
import Link from '../../../../components/Link/Link';
import Icon from '../../../../components/Icon/Icon';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';

import {showEditPoolsWeightsModal, updateOperations} from '../../../../store/actions/operations';
import {performAction} from '../../../../utils/operations/detail';
import {prepareActions} from '../../../../utils/operations/details-ts';
import {promptAction} from '../../../../store/actions/actions';
import '../../../../components/templates/meta';
import OperationIOLink from '../../OperationIOLink/OperationIOLink';

import './OperationsListTable.scss';

const BLOCK_NAME = 'operations-list';
const block = cn(BLOCK_NAME);

function renderIO(io) {
    const className = block('item-io');

    return (
        <span className={className}>
            {renderText(io.count, {
                mix: {block: BLOCK_NAME, elem: 'item-io-count'},
            })}
            {
                <OperationIOLink
                    path={io.table}
                    {...io}
                    theme={'ghost'}
                    className={block('item-io-table')}
                />
            }
        </span>
    );
}

function getTitle(item) {
    return typeof item.title !== 'undefined' ? item.title : item.$value;
}

function renderTitle(item, url) {
    const title = getTitle(item);
    return (
        <Link
            routed
            className="elements-ellipsis"
            url={`${trimEnd(url, '/')}/${item.$value}`}
            theme="primary"
        >
            <span>{unipika.decode(title)}</span>
        </Link>
    );
}

function renderCopyTitle(item) {
    return (
        <ClipboardButton
            text={item.$value}
            view="flat-secondary"
            size="s"
            title={'Copy operation id'}
            className={block('item-title-copy')}
        />
    );
}

function UserPoolItem({awesomeIcon, children, title}) {
    return (
        <div className={block('user-pool-item')}>
            <div className={block('user-pool-item-icon')}>
                <Tooltip content={title} to={'left'} allowUnmounted>
                    <Icon face={'solid'} awesome={awesomeIcon} />
                </Tooltip>
            </div>
            <div className={block('user-pool-item-name')}>{children}</div>
        </div>
    );
}

const metaItem = templates.get('elements/meta').item;

class OperationsListTable extends Component {
    static propTypes = {
        // from connect
        operations: PropTypes.arrayOf(PropTypes.object).isRequired,
        initialLoading: PropTypes.bool.isRequired,
        cluster: PropTypes.string.isRequired,

        showEditPoolsWeightsModal: PropTypes.func.isRequired,
        promptAction: PropTypes.func.isRequired,
        updateOperations: PropTypes.func.isRequired,
        // from react-router
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }),
    };

    static renderType(item) {
        return (
            <span className={block('item-type')}>{hammer.format['ReadableField'](item.type)}</span>
        );
    }

    static renderStartTime(item) {
        return (
            <div className={block('item-start-time')}>
                <div className={block('item-start-time-human')}>
                    {hammer.format['DateTime'](item.startTime, {
                        format: 'human',
                    })}
                </div>
                <div className={block('item-start-time-default')}>
                    {hammer.format['DateTime'](item.startTime)}
                </div>
                <div className={block('item-duration')} title="Duration">
                    {hammer.format['TimeDuration'](item.duration)}
                </div>
            </div>
        );
    }

    static renderProgress(item) {
        return <OperationProgress operation={item} showState />;
    }

    renderTitle = (item) => {
        const {url} = this.props.match;

        return (
            <div>
                <div className={block('item-title')}>
                    {renderCopyTitle(item)}
                    {renderTitle(item, url)}
                </div>
                <div className={block('item-io')}>
                    {item.input.count > 0 &&
                        metaItem({
                            key: 'in',
                            valueTemplate: renderIO,
                            value: item.input,
                        })}
                    {item.output.count > 0 &&
                        metaItem({
                            key: 'out',
                            valueTemplate: renderIO,
                            value: item.output,
                        })}
                </div>
            </div>
        );
    };

    renderMultiplePools(item) {
        const {showEditPoolsWeightsModal} = this.props;

        return (
            <span className={block('multiply-pools')}>
                {item.pools.length}
                <Button
                    size="s"
                    view="flat-secondary"
                    title="Show pools and weights"
                    className={block('view-button')}
                    onClick={() => showEditPoolsWeightsModal(item, false)}
                >
                    <Icon awesome="eye" />
                    &nbsp;View
                </Button>

                <Button
                    size="s"
                    view="flat-secondary"
                    title="Edit pools and weights"
                    className={block('edit-button')}
                    onClick={() => showEditPoolsWeightsModal(item)}
                >
                    <Icon awesome="pencil" />
                </Button>
            </span>
        );
    }

    renderUserPool = (item) => {
        const {showEditPoolsWeightsModal, cluster} = this.props;
        const {pools, user, state} = item;
        const multiplePools = pools?.length > 1 || false;

        return (
            <React.Fragment>
                <UserPoolItem awesomeIcon={'user'} title={'User'}>
                    <UserCard userName={user} />
                </UserPoolItem>
                <UserPoolItem awesomeIcon={'poll-people'} title={'Pool'}>
                    {multiplePools ? (
                        this.renderMultiplePools(item)
                    ) : (
                        <TemplatePools
                            onEdit={() => showEditPoolsWeightsModal(item)}
                            cluster={cluster}
                            pools={pools}
                            state={state}
                            compact
                        />
                    )}
                </UserPoolItem>
                {!multiplePools && (
                    <UserPoolItem awesomeIcon={'weight-hanging'} title={'Weight'}>
                        <TemplateWeight
                            onEdit={() => showEditPoolsWeightsModal(item)}
                            operation={item}
                            pool={pools[0]}
                        />
                    </UserPoolItem>
                )}
            </React.Fragment>
        );
    };

    renderActions = (operation) => {
        const {promptAction, updateOperations: updateOperation} = this.props;

        const actions = prepareActions(operation);

        return (
            <div className={block('actions')}>
                {_.map(actions, (action) => {
                    const {icon, name, $value} = action;
                    const text = hammer.format['Readable'](name);
                    const message = action.message || (
                        <span>
                            Are you sure you want to <strong>{action.name}</strong> the operation{' '}
                            {$value}?
                        </span>
                    );
                    const handler = ({currentOption}) =>
                        performAction({
                            ...action,
                            operation,
                            currentOption,
                            updateOperation,
                        });

                    return (
                        <Button
                            withTooltip
                            size="m"
                            key={name}
                            view="flat-secondary"
                            tooltipProps={{
                                placement: 'bottom',
                                content: text,
                            }}
                            onClick={() => promptAction({...action, message, handler})}
                        >
                            <Icon awesome={icon} />
                        </Button>
                    );
                })}
            </div>
        );
    };

    settings = {
        css: 'operations-list',
        theme: 'light',
        striped: false,
        virtualType: 'simple',
        getItemLink: (item) => `${this.props.match.url}/${item.$value}`,
        computeKey: (item) => item.$value,
        columns: {
            sets: {
                default: {
                    items: ['title', 'type', 'user_pool', 'start_time', 'progress', 'actions'],
                },
            },
            mode: 'default',
            items: {
                title: {
                    name: 'title',
                    sort: false,
                    align: 'left',
                },
                type: {
                    name: 'type',
                    sort: false,
                    align: 'left',
                },
                user: {
                    name: 'user',
                    sort: false,
                    align: 'left',
                },
                pool: {
                    name: 'pool',
                    sort: false,
                    align: 'left',
                },
                user_pool: {
                    name: 'user_pool',
                    sort: false,
                    caption: 'User / Pool',
                    align: 'left',
                },
                start_time: {
                    name: 'start_time',
                    sort: false,
                    align: 'left',
                },
                progress: {
                    name: 'progress',
                    sort: false,
                    align: 'left',
                    caption: 'State / Progress',
                },
                actions: {
                    name: 'actions',
                    caption: '',
                    sort: false,
                    align: 'right',
                },
            },
        },
        templates: {
            title: this.renderTitle,
            user_pool: this.renderUserPool,
            type: OperationsListTable.renderType,
            start_time: OperationsListTable.renderStartTime,
            progress: OperationsListTable.renderProgress,
            actions: this.renderActions,
        },
    };

    render() {
        const {operations, initialLoading} = this.props;

        return (
            <ElementsTable
                emptyDataDescription="Please, change your filtering settings to see search results"
                isLoading={initialLoading}
                items={operations}
                {...this.settings}
            />
        );
    }
}

function mapStateToProps({operations, global}) {
    const {isLoading, hasLoaded} = operations.list;
    const initialLoading = isLoading && !hasLoaded;

    return {
        initialLoading,
        cluster: global.cluster,
        operations: operations.list.operations,
    };
}

const mapDispatchToProps = {
    showEditPoolsWeightsModal,
    promptAction,
    updateOperations,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OperationsListTable));
