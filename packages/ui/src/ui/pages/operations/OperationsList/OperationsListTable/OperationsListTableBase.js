import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../../../common/hammer';
import cn from 'bem-cn-lite';
import trimEnd_ from 'lodash/trimEnd';

import ypath from '../../../../common/thor/ypath';
import unipika from '../../../../common/thor/unipika';
import OperationProgress from '../../../../pages/operations/OperationProgress/OperationProgress';
import {ClipboardButton, Tooltip} from '@ytsaurus/components';
import {
    TemplatePools,
    TemplateWeight,
} from '../../../../components/MetaTable/templates/OperationTemplate';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import {SubjectCard} from '../../../../components/SubjectLink/SubjectLink';
import Button from '../../../../components/Button/Button';
import Link from '../../../../containers/Link/Link';
import Icon from '../../../../components/Icon/Icon';
import {OperationType} from '../../../../components/OperationType/OperationType';

import {
    showEditPoolsWeightsModal,
    updateOperationsList,
} from '../../../../store/actions/operations';
import {performAction, prepareActions} from '../../../../utils/operations/detail';
import {promptAction} from '../../../../store/actions/actions';
import {PathItem} from './PathItem';
import i18n from './i18n';

import './OperationsListTable.scss';

const BLOCK_NAME = 'operations-list';
const block = cn(BLOCK_NAME);

function getTitle(item) {
    return typeof item.title !== 'undefined' ? item.title : item.$value;
}

function renderTitle(item, url) {
    const title = getTitle(item);
    return (
        <Link
            routed
            className="elements-ellipsis"
            url={`${trimEnd_(url, '/')}/${item.$value}`}
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
            title={i18n('action_copy-operation-id')}
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

class OperationsListTable extends Component {
    static propTypes = {
        // from connect
        operations: PropTypes.arrayOf(PropTypes.object).isRequired,
        initialLoading: PropTypes.bool.isRequired,
        cluster: PropTypes.string.isRequired,

        showEditPoolsWeightsModal: PropTypes.func.isRequired,
        promptAction: PropTypes.func.isRequired,
        updateOperationsList: PropTypes.func.isRequired,
        // from react-router
        match: PropTypes.shape({
            url: PropTypes.string.isRequired,
        }),
    };

    static renderType(item) {
        return <OperationType value={item.type} />;
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
                <div className={block('item-duration')} title={i18n('context_duration')}>
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

        const isRunning = ypath.getValue(item, '/@state') === 'running';
        const inputTx = isRunning
            ? ypath.getValue(item, '/@brief_spec/input_transaction_id')
            : undefined;
        const outputTx = isRunning
            ? ypath.getValue(item, '/@brief_spec/output_transaction_id')
            : undefined;
        const user_transaction_id = isRunning
            ? ypath.getValue(item, '/@brief_spec/user_transaction_id')
            : undefined;

        return (
            <div>
                <div className={block('item-title')}>
                    {renderCopyTitle(item)}
                    {renderTitle(item, url)}
                </div>
                <div className={block('item-io')}>
                    {item.input.count > 0 && (
                        <PathItem
                            caption="in"
                            item={item.input}
                            {...{user_transaction_id, transaction: inputTx}}
                        />
                    )}
                    {item.output.count > 0 && (
                        <PathItem
                            caption="out"
                            item={item.output}
                            {...{user_transaction_id, transaction: outputTx}}
                        />
                    )}
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
                    title={i18n('action_show-pools-weights')}
                    className={block('view-button')}
                    onClick={() => showEditPoolsWeightsModal(item, false)}
                >
                    <Icon awesome="eye" />
                    &nbsp;{i18n('action_view')}
                </Button>

                <Button
                    size="s"
                    view="flat-secondary"
                    title={i18n('action_edit-pools-weights')}
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
                <UserPoolItem awesomeIcon={'user'} title={i18n('title_user')}>
                    <SubjectCard name={user} />
                </UserPoolItem>
                <UserPoolItem awesomeIcon={'poll-people'} title={i18n('title_pool')}>
                    {multiplePools ? (
                        this.renderMultiplePools(item)
                    ) : (
                        <TemplatePools
                            onEdit={() => showEditPoolsWeightsModal(item)}
                            cluster={cluster}
                            pools={pools}
                            state={state}
                            allowDetachEditBtn
                            hideIcon
                            hideTree
                        />
                    )}
                </UserPoolItem>
                {!multiplePools && (
                    <UserPoolItem awesomeIcon={'weight-hanging'} title={i18n('title_weight')}>
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
        const {promptAction} = this.props;

        const actions = prepareActions(operation);

        return (
            <div className={block('actions')}>
                {actions.map((action) => {
                    const {icon, name, $value} = action;
                    const text = hammer.format['Readable'](name);
                    const message =
                        action.message ||
                        i18n('confirm_perform-action', {
                            actionName: action.name,
                            operationId: $value,
                        });
                    const handler = ({currentOption}) =>
                        performAction({
                            ...action,
                            operation,
                            currentOption,
                        }).then(() => {
                            this.props.updateOperationsList();
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
                    get caption() {
                        return i18n('field_title');
                    },
                    sort: false,
                    align: 'left',
                },
                type: {
                    name: 'type',
                    get caption() {
                        return i18n('field_type');
                    },
                    sort: false,
                    align: 'left',
                },
                user: {
                    name: 'user',
                    get caption() {
                        return i18n('field_user');
                    },
                    sort: false,
                    align: 'left',
                },
                pool: {
                    name: 'pool',
                    get caption() {
                        return i18n('field_pool');
                    },
                    sort: false,
                    align: 'left',
                },
                user_pool: {
                    name: 'user_pool',
                    sort: false,
                    get caption() {
                        return i18n('field_user-pool');
                    },
                    align: 'left',
                },
                start_time: {
                    name: 'start_time',
                    get caption() {
                        return i18n('field_start-time');
                    },
                    sort: false,
                    align: 'left',
                },
                progress: {
                    name: 'progress',
                    sort: false,
                    align: 'left',
                    get caption() {
                        return i18n('field_state-progress');
                    },
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
                emptyDataDescription={i18n('alert_change-filter-settings')}
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
    updateOperationsList,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OperationsListTable));
