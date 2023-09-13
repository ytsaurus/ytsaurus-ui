import {Sticky, StickyContainer} from 'react-sticky';
import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import block from 'bem-cn-lite';

import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import TableInfo from '../../../../pages/components/TableInfo/TableInfo';
import Filter from '../../../../components/Filter/Filter';
import Select from '../../../../components/Select/Select';

import {
    getBannedSelectItems,
    getStatesSelectItems,
    getTypeSelectItems,
    getVersionSelectItems,
    getVisibleDetails,
} from '../../../../store/selectors/components/versions/versions_v2';
import {
    changeBannedFilter,
    changeHostFilter,
    changeStateFilter,
    changeTypeFilter,
    changeVersionFilter,
    getVersions,
} from '../../../../store/actions/components/versions/versions_v2';
import {
    DEBOUNCE_TIME,
    POLLING_INTERVAL,
} from '../../../../constants/components/versions/versions_v2';
import {detailsTableProps} from '../../../../utils/components/versions/tables_v2';
import {HEADER_HEIGHT} from '../../../../constants/index';
import Updater from '../../../../utils/hammer/updater';
import VersionsSummary from './VersionSummary';
import {RootState} from '../../../../store/reducers';
import {getUISizes} from '../../../../store/selectors/global';

import './Versions.scss';

const b = block('components-versions');
const updater = new Updater();

type ReduxProps = ConnectedProps<typeof connector>;

class VersionsV2 extends React.Component<ReduxProps> {
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

    onBannedChange = (value: string) => {
        const {changeBannedFilter} = this.props;
        const v =
            {
                false: false,
                true: true,
                all: 'all' as const,
            }[value] ?? 'all';
        changeBannedFilter(v);
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

        const {error, ...rest} = this.props;

        return (
            <ErrorBoundary>
                <LoadDataHandler {...rest} error={Boolean(error)} errorData={error}>
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

const mapStateToProps = (state: RootState) => {
    const {
        loading,
        loaded,
        error,
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

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(VersionsV2);
