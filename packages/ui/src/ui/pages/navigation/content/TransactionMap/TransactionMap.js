import React, {Component} from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../store/redux-hooks';
import PropTypes from 'prop-types';
import hammer from '../../../../common/hammer';
import cn from 'bem-cn-lite';

import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import {FormattedText, FormattedTextOrLink} from '../../../../components/formatters';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import Filter from '../../../../components/Filter/Filter';
import Icon from '../../../../components/Icon/Icon';
import {StickyContainer} from '../../../../components/StickyContainer/StickyContainer';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';

import {NAVIGATION_TRANSACTION_MAP_TABLE_ID} from '../../../../constants/navigation/content/transaction-map';
import {
    changeFilter,
    loadTransactions,
} from '../../../../store/actions/navigation/content/transaction-map';
import {
    getNavigationTransactionMapLoadingStatus,
    getTransactions,
} from '../../../../store/selectors/navigation/content/transaction-map';
import {tableItems} from '../../../../utils/navigation/content/transaction-map/table';
import {getIconNameForType} from '../../../../utils/navigation/path-editor';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {itemNavigationAllowed} from '../../../../pages/navigation/Navigation/ContentViewer/helpers';

import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import './TransactionMap.scss';

const block = cn('navigation-transaction-map');

class TransactionMap extends Component {
    static propTypes = {
        // from connect
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        path: PropTypes.string.isRequired,
        filter: PropTypes.string.isRequired,
        transactions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        transaction: PropTypes.string,

        changeFilter: PropTypes.func.isRequired,
        loadTransactions: PropTypes.func.isRequired,
    };

    static renderIcon(item) {
        const iconName = getIconNameForType(item.type);

        return <Icon awesome={iconName} />;
    }

    static renderId(item) {
        const isLink = itemNavigationAllowed(item);

        return <FormattedTextOrLink state={item.pathState} asLink={isLink} text={item.id} />;
    }

    static renderOwner(item) {
        return <FormattedText text={item.owner} />;
    }

    static renderStartTime(item) {
        return hammer.format['DateTime'](item.started, {format: 'full'});
    }

    static renderTitle(item) {
        return <FormattedText text={item.title} />;
    }

    static renderActions(item) {
        return (
            <ClickableAttributesButton
                title={item.id}
                path={`//sys/transactions/${item.id}`}
                withTooltip
            />
        );
    }

    componentDidMount() {
        this.props.loadTransactions();
    }

    componentDidUpdate(prevProps) {
        const {path, transaction, loadTransactions} = this.props;

        if (prevProps.path !== path || prevProps.transaction !== transaction) {
            loadTransactions();
        }
    }

    get tableSettings() {
        return {
            css: block(),
            theme: 'light',
            cssHover: true,
            striped: false,
            tableId: NAVIGATION_TRANSACTION_MAP_TABLE_ID,
            columns: {
                items: tableItems,
                sets: {
                    default: {
                        items: ['icon', 'id', 'title', 'owner', 'start_time', 'actions'],
                    },
                },
                mode: 'default',
            },
            templates: {
                icon: TransactionMap.renderIcon,
                id: TransactionMap.renderId,
                owner: TransactionMap.renderOwner,
                start_time: TransactionMap.renderStartTime,
                title: TransactionMap.renderTitle,
                actions: TransactionMap.renderActions,
            },
            computeKey(item) {
                return item.id;
            },
        };
    }

    handleFilterChange = (value) => this.props.changeFilter(value);

    render() {
        const {filter, loading, transactions} = this.props;

        return (
            <div className={block()}>
                <StickyContainer>
                    {({stickyTopClassName}) => (
                        <React.Fragment>
                            <Toolbar
                                className={stickyTopClassName}
                                itemsToWrap={[
                                    {
                                        node: (
                                            <Filter
                                                hasClear
                                                size="m"
                                                value={filter}
                                                debounce={300}
                                                className={block('filter')}
                                                onChange={this.handleFilterChange}
                                                placeholder="Filter transactions..."
                                            />
                                        ),
                                    },
                                ]}
                            />
                            <LoadDataHandler {...this.props}>
                                <ElementsTable
                                    {...this.tableSettings}
                                    items={transactions}
                                    isLoading={loading}
                                />
                            </LoadDataHandler>
                        </React.Fragment>
                    )}
                </StickyContainer>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {filter, loading, loaded, error, errorData} = state.navigation.content.transactionMap;
    const path = getPath(state);
    const transaction = getTransaction(state);
    const transactions = getTransactions(state);

    return {
        loading,
        loaded,
        error,
        errorData,
        path,
        transaction,
        filter,
        transactions,
    };
};

const mapDispatchToProps = {
    loadTransactions,
    changeFilter,
};

const TransactionMapConnected = connect(mapStateToProps, mapDispatchToProps)(TransactionMap);

export default function TranscationMapWithRum() {
    const loadState = useSelector(getNavigationTransactionMapLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_TRANSACTION_MAP,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_TRANSACTION_MAP,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <TransactionMapConnected />;
}
