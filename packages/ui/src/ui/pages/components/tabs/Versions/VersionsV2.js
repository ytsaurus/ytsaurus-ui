import {Sticky, StickyContainer} from 'react-sticky';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import TableInfo from '../../../../pages/components/TableInfo/TableInfo';
import Filter from '../../../../components/Filter/Filter';
import Select from '../../../../components/Select/Select';

import {
    getVisibleDetails,
    getVersionSelectItems,
    getTypeSelectItems,
    getStatesSelectItems,
    getBannedSelectItems,
} from '../../../../store/selectors/components/versions/versions_v2';
import {
    getVersions,
    changeHostFilter,
    changeVersionFilter,
    changeTypeFilter,
    changeStateFilter,
    changeBannedFilter,
} from '../../../../store/actions/components/versions/versions_v2';
import {
    DEBOUNCE_TIME,
    POLLING_INTERVAL,
} from '../../../../constants/components/versions/versions_v2';
import {detailsTableProps} from '../../../../utils/components/versions/tables_v2';
import {HEADER_HEIGHT} from '../../../../constants/index';
import Updater from '../../../../utils/hammer/updater';
import VersionsSummary from './VersionSummary';

import './Versions.scss';
import {getUISizes} from '../../../../store/selectors/global';

const b = block('components-versions');
const updater = new Updater();

class VersionsV2 extends Component {
    static selectProps = PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        }),
    );

    static propTypes = {
        // from connect
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        details: PropTypes.arrayOf(
            PropTypes.shape({
                address: PropTypes.string,
                version: PropTypes.string,
                primary_masters: PropTypes.number,
                secondary_masters: PropTypes.number,
                schedulers: PropTypes.number,
                nodes: PropTypes.number,
                http_proxies: PropTypes.number,
                rpc_proxies: PropTypes.number,
                errors: PropTypes.string,
                start_time: PropTypes.string,
            }),
        ).isRequired,
        showingItems: PropTypes.number.isRequired,
        totalItems: PropTypes.number.isRequired,
        hostFilter: PropTypes.string.isRequired,
        versionFilter: PropTypes.string.isRequired,
        typeFilter: PropTypes.string.isRequired,
        stateFilter: PropTypes.string.isRequired,
        versionSelectItems: VersionsV2.selectProps.isRequired,
        typeSelectItems: VersionsV2.selectProps.isRequired,
        stateSelectItems: VersionsV2.selectProps.isRequired,

        getVersions: PropTypes.func.isRequired,
        changeHostFilter: PropTypes.func.isRequired,
        changeVersionFilter: PropTypes.func.isRequired,
        changeTypeFilter: PropTypes.func.isRequired,
        changeStateFilter: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const {getVersions} = this.props;

        updater.add('components.versions_v2', getVersions, POLLING_INTERVAL);
    }

    componentWillUnmount() {
        updater.remove('components.versions_v2');
    }

    renderFilters() {
        const {
            hostFilter,
            changeHostFilter,
            versionFilter,
            versionSelectItems,
            changeVersionFilter,
            typeFilter,
            typeSelectItems,
            changeTypeFilter,
            stateFilter,
            stateSelectItems,
            changeStateFilter,
            bannedFilter,
        } = this.props;

        return (
            <div className={b('filters')}>
                <div className={b('filter', {address: true})}>
                    <Filter
                        hasClear
                        size="m"
                        type="text"
                        key={hostFilter}
                        value={hostFilter}
                        debounce={DEBOUNCE_TIME}
                        onChange={changeHostFilter}
                        placeholder="Filter host..."
                    />
                </div>

                <div className={b('filter', {version: true})}>
                    <Select
                        value={[versionFilter]}
                        items={versionSelectItems}
                        onUpdate={(vals) => changeVersionFilter(vals[0])}
                        label="Version:"
                        width="max"
                        hideFilter
                    />
                </div>

                <div className={b('filter', {type: true})}>
                    <Select
                        value={[typeFilter]}
                        items={typeSelectItems}
                        onUpdate={(vals) => changeTypeFilter(vals[0])}
                        label="Type:"
                        width="max"
                        hideFilter
                    />
                </div>

                <div className={b('filter', {state: true})}>
                    <Select
                        value={[stateFilter]}
                        items={stateSelectItems}
                        onUpdate={(vals) => changeStateFilter(vals[0])}
                        label="State:"
                        width="max"
                        hideFilter
                    />
                </div>

                <div className={b('filter', {banned: true})}>
                    <Select
                        value={[String(bannedFilter)]}
                        items={this.getBannedItems()}
                        onUpdate={(vals) => this.onBannedChange(vals[0])}
                        label="Banned:"
                        width="max"
                        hideFilter
                    />
                </div>
            </div>
        );
    }

    getBannedItems() {
        const {bannedSelectItems} = this.props;
        return bannedSelectItems.map(({value, ...rest}) => {
            return {
                value: String(value),
                ...rest,
            };
        });
    }

    onBannedChange = (value) => {
        const {changeBannedFilter} = this.props;
        const v = {
            [false]: false,
            [true]: true,
        }[value];
        changeBannedFilter(v === undefined ? value : v);
    };

    renderOverview() {
        const {showingItems, totalItems} = this.props;

        return (
            <Sticky topOffset={-HEADER_HEIGHT}>
                {({isSticky}) => (
                    <div className={b('overview', {sticky: isSticky})}>
                        {this.renderFilters()}

                        <TableInfo showingItems={showingItems} totalItems={totalItems} />
                    </div>
                )}
            </Sticky>
        );
    }

    render() {
        const {details, loading, loaded, collapsibleSize} = this.props;
        const initialLoading = loading && !loaded;

        return (
            <ErrorBoundary>
                <LoadDataHandler {...this.props}>
                    <div className={b()}>
                        <CollapsibleSection
                            name="Summary"
                            className={b('summary')}
                            collapsed={false}
                            size={collapsibleSize}
                        >
                            <VersionsSummary />
                        </CollapsibleSection>

                        <StickyContainer>
                            <CollapsibleSection
                                name="Details"
                                className={b('details')}
                                collapsed={false}
                                size={collapsibleSize}
                            >
                                {this.renderOverview()}

                                <ElementsTable
                                    {...detailsTableProps}
                                    isLoading={initialLoading}
                                    items={details}
                                />
                            </CollapsibleSection>
                        </StickyContainer>
                    </div>
                </LoadDataHandler>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state) => {
    const {
        loading,
        loaded,
        error,
        errorData,
        hostFilter,
        versionFilter,
        typeFilter,
        stateFilter,
        bannedFilter,
        details: allDetails,
    } = state.components.versionsV2;

    const details = getVisibleDetails(state);
    const versionSelectItems = getVersionSelectItems(state);
    const typeSelectItems = getTypeSelectItems(state);
    const stateSelectItems = getStatesSelectItems(state);
    const bannedSelectItems = getBannedSelectItems(state);

    const showingItems = details.length;
    const totalItems = allDetails.length;

    return {
        loading,
        loaded,
        error,
        errorData,
        details,
        showingItems,
        totalItems,
        hostFilter,
        versionFilter,
        typeFilter,
        stateFilter,
        bannedFilter,
        versionSelectItems,
        typeSelectItems,
        stateSelectItems,
        bannedSelectItems,

        collapsibleSize: getUISizes(state).collapsibleSize,
    };
};

const mapDispatchToProps = {
    getVersions,
    changeHostFilter,
    changeVersionFilter,
    changeTypeFilter,
    changeStateFilter,
    changeBannedFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(VersionsV2);
