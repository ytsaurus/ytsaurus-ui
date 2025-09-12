import React, {Component, Fragment} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import unipika from '../../../../common/thor/unipika';

import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import {FormattedLink, FormattedText} from '../../../../components/formatters';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import {TemplateTime} from '../../../../components/MetaTable/templates/TemplateTime';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import {Loader} from '@gravity-ui/uikit';
import Link from '../../../../components/Link/Link';
import {Linkify} from '../../../../components/Linkify/Linkify';

import {MAX_TRANSACTIONS_REQUESTS} from '../../../../constants/navigation/tabs/locks';
import {
    abortAndReset,
    getLocks,
    setLocksModeFilter,
} from '../../../../store/actions/navigation/tabs/locks';
import {Page} from '../../../../constants/index';
import {findClusterConfigByOperationId} from '../../../../utils/clusters';

import {
    getLocksFiltered,
    getLocksLoadStatus,
    getLocksModeFilter,
} from '../../../../store/selectors/navigation/tabs/locks';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import Yson from '../../../../components/Yson/Yson';
import CustomRadioButton from '../../../../components/RadioButton/RadioButton';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';

import './Locks.scss';

const block = cn('navigation-locks');
const messageBlock = cn('elements-message');

class Locks extends Component {
    static propTypes = {
        // from connect
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        isPartial: PropTypes.bool.isRequired,
        locks: PropTypes.arrayOf(
            PropTypes.shape({
                child_key: PropTypes.string,
                id: PropTypes.string.isRequired,
                index: PropTypes.number.isRequired,
                mode: PropTypes.string.isRequired,
                state: PropTypes.string.isRequired,
                transaction_id: PropTypes.string.isRequired,
                transaction: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    start_time: PropTypes.string,
                    title: PropTypes.string,
                    operation_id: PropTypes.string,
                }).isRequired,
            }),
        ).isRequired,

        getLocks: PropTypes.func.isRequired,
        abortAndReset: PropTypes.func.isRequired,
    };

    static renderIndex({index}) {
        return <FormattedText text={index + 1} />;
    }

    static renderLock(item) {
        return (
            <MetaTable
                qa="lock-meta-table"
                items={[
                    {key: 'id', value: item.id, className: block('id')},
                    {key: 'mode', value: item.mode},
                    {key: 'state', value: item.state},
                    {
                        key: 'child_key',
                        value: item.child_key,
                        visible: Boolean(item.child_key),
                    },
                    {
                        key: 'attribute_key',
                        value: item.attribute_key,
                        visible: Boolean(item.attribute_key),
                    },
                ]}
            />
        );
    }

    componentDidMount() {
        this.props.getLocks();
    }

    componentWillUnmount() {
        this.props.abortAndReset();
    }

    tableSettings = {
        theme: 'light',
        itemHeight: 100,
        columns: {
            items: {
                index: {
                    sort: false,
                    caption: '#',
                    align: 'center',
                },
                lock: {
                    sort: false,
                    align: 'left',
                },
                transaction: {
                    sort: false,
                    align: 'left',
                },
            },
            sets: {
                default: {
                    items: ['index', 'lock', 'transaction'],
                },
            },
            mode: 'default',
        },
        computeKey(item) {
            return item.id;
        },
    };

    renderTransaction = ({transaction}) => {
        const operationId = transaction.operation_id;
        const {id: clusterId} = findClusterConfigByOperationId(operationId) || {};
        if (operationId && !clusterId) {
            console.error(new Error(`Cannot find cluster by operation id ${operationId}`));
        }
        const operationIdUrl = `/${clusterId}/operations/${operationId}`;

        const title = unipika.decode(String(transaction.title));

        return (
            <MetaTable
                items={[
                    {
                        key: 'id',
                        value: (
                            <FormattedLink
                                text={transaction.id}
                                state={{
                                    page: Page.NAVIGATION,
                                    path: '//sys/transactions/' + transaction.id,
                                }}
                            />
                        ),
                        className: block('id'),
                    },
                    {
                        key: 'title',
                        value: (
                            <Tooltip
                                content={<Yson value={transaction.title} />}
                                to={['top-center', 'bottom-center']}
                            >
                                <div className={block('title-tooltip')}>
                                    <div className={block('title', 'unipika')}>
                                        <Linkify className={'string'} text={title} />
                                    </div>
                                </div>
                            </Tooltip>
                        ),
                        visible: Boolean(transaction.title),
                    },
                    {
                        key: 'start_time',
                        value: (
                            <TemplateTime time={transaction.start_time} valueFormat="DateTime" />
                        ),
                        visible: Boolean(transaction.start_time),
                        className: block('start-time'),
                    },
                    {
                        key: 'operation_id',
                        value: <Link url={operationIdUrl}>{operationId}</Link>,
                        visible: Boolean(operationId) || Boolean(clusterId),
                    },
                ]}
            />
        );
    };

    get templates() {
        return {
            index: Locks.renderIndex,
            lock: Locks.renderLock,
            transaction: this.renderTransaction,
        };
    }

    renderMessage() {
        return (
            <div className={messageBlock({theme: 'info'})}>
                <p className="elements-message__paragraph">
                    Transaction information was only loaded for first {MAX_TRANSACTIONS_REQUESTS}{' '}
                    locks.
                </p>
            </div>
        );
    }

    onModeFilter = (e) => {
        const mode = e.target.value;
        this.props.setLocksModeFilter(mode);
    };

    renderModeFilter() {
        const {modeFilter} = this.props;
        return (
            <Toolbar
                className={block('toolbar')}
                itemsToWrap={[
                    {
                        name: 'buttons',
                        node: (
                            <CustomRadioButton
                                qa="locks-type-filter"
                                onChange={this.onModeFilter}
                                value={modeFilter}
                                items={[
                                    {
                                        text: 'All',
                                        value: '',
                                    },
                                    {
                                        text: 'Exclusive',
                                        value: 'exclusive',
                                    },
                                    {
                                        text: 'Shared',
                                        value: 'shared',
                                    },
                                    {
                                        text: 'Snapshot',
                                        value: 'snapshot',
                                    },
                                ]}
                            />
                        ),
                    },
                ]}
            />
        );
    }

    renderContent() {
        const {isPartial, locks} = this.props;
        const toolbar = this.renderModeFilter();

        return (
            <WithStickyToolbar
                toolbar={toolbar}
                content={
                    <Fragment>
                        {isPartial && this.renderMessage()}
                        <ElementsTable
                            {...this.tableSettings}
                            templates={this.templates}
                            items={locks}
                            css={block()}
                        />
                    </Fragment>
                }
            />
        );
    }

    render() {
        const {loading, loaded} = this.props;
        const initialLoading = loading && !loaded;

        return (
            <LoadDataHandler {...this.props}>
                <div className={block({loading: initialLoading})}>
                    {initialLoading ? <Loader /> : this.renderContent()}
                </div>
            </LoadDataHandler>
        );
    }
}

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, isPartial} = state.navigation.tabs.locks;

    return {
        loading,
        loaded,
        error,
        errorData,

        modeFilter: getLocksModeFilter(state),
        locks: getLocksFiltered(state),
        isPartial,
    };
};
const mapDispatchToProps = {
    getLocks,
    abortAndReset,
    setLocksModeFilter,
};

const LocksConnected = connect(mapStateToProps, mapDispatchToProps)(Locks);

export default function LocksWithRum() {
    const loadState = useSelector(getLocksLoadStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_TAB_LOCKS,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_TAB_LOCKS,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <LocksConnected />;
}
