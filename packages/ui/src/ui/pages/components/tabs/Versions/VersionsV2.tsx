import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import {useDispatch} from '../../../../store/redux-hooks';

import cn from 'bem-cn-lite';

import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import TableInfo from '../../../../pages/components/TableInfo/TableInfo';
import Filter from '../../../../components/Filter/Filter';
import Select from '../../../../components/Select/Select';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';

import {ClickableText} from '../../../../components/ClickableText/ClickableText';
import Icon from '../../../../components/Icon/Icon';

import format from '../../../../common/hammer/format';

import {VersionCellWithAction} from '../../../../pages/components/tabs/Versions/VersionCell';

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
import {DEBOUNCE_TIME} from '../../../../constants/components/versions/versions_v2';
import {useUpdater} from '../../../../hooks/use-updater';
import VersionsSummary from './VersionSummary';
import {RootState} from '../../../../store/reducers';

import templates, {ColumnAsTime, printColumnAsError} from '../../../../components/templates/utils';
import {VersionHostInfo} from '../../../../store/reducers/components/versions/versions_v2';
import {ClickableId, NodeColumnBanned, NodeColumnState} from '../NodeColumns';
import {Host} from '../../../../containers/Host/Host';

import {detailsTableProps} from './tables_v2';

import './Versions.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../../constants/global';

const b = cn('components-versions');

function VersionsV2Updater() {
    const dispatch = useDispatch();

    const updateFn = React.useCallback(() => {
        dispatch(getVersions());
    }, [dispatch]);

    useUpdater(updateFn);

    return null;
}

type ReduxProps = ConnectedProps<typeof connector>;

class VersionsV2 extends React.Component<ReduxProps> {
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
                        autofocus={false}
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

    renderToolbar() {
        const {showingItems, totalItems} = this.props;

        return (
            <Toolbar
                itemsToWrap={[
                    {node: this.renderFilters(), growable: true},
                    {node: <TableInfo showingItems={showingItems} totalItems={totalItems} />},
                ]}
            />
        );
    }

    getDetailsTemplates() {
        const {changeVersionFilter, changeHostFilter, changeTypeFilter} = this.props;

        const res: Record<string, (item: VersionHostInfo) => React.ReactNode> = {
            start_time: (item) => <ColumnAsTime value={item.start_time} />,
            type: (item) => (
                <ClickableId
                    text={item.type}
                    onClick={() => changeTypeFilter(item.type)}
                    format={format.ReadableField}
                />
            ),
            error: (item) => printColumnAsError(item.error),
            address: (item) => {
                return (
                    <Host
                        address={item.address}
                        onClick={() => changeHostFilter(item.address)}
                        useText
                    />
                );
            },
            state: (item) => <NodeColumnState state={item.state} />,
            banned: (item) => <NodeColumnBanned banned={item.banned} />,
            decommissioned: templates.get('components').decommissioned,
            full: templates.get('components').full,
            alerts: templates.get('components').alerts,
            version(item) {
                const version = item.version;
                const versionIsError = version === 'error';
                const versionIsTotal = version === 'total';
                const handleClick = () => changeVersionFilter(version);

                if (versionIsError || versionIsTotal) {
                    return (
                        <ClickableText
                            color="primary"
                            onClick={handleClick}
                            className={cn('elements-table')(
                                `cell_type`,
                                {version: version === 'error' ? 'error' : undefined},
                                'elements-monospace elements-ellipsis',
                            )}
                        >
                            {versionIsError && <Icon awesome="exclamation-triangle" />}
                            {format.FirstUppercase(version)}
                        </ClickableText>
                    );
                } else {
                    return <VersionCellWithAction version={version} />;
                }
            },
        };
        return res;
    }

    render() {
        const {details, loading, loaded} = this.props;
        const initialLoading = loading && !loaded;

        const {error, ...rest} = this.props;

        return (
            <ErrorBoundary>
                <VersionsV2Updater />
                <LoadDataHandler {...rest} error={Boolean(error)} errorData={error}>
                    <div className={b()}>
                        <CollapsibleSection
                            name="Summary"
                            className={b('summary')}
                            collapsed={false}
                            size={UI_COLLAPSIBLE_SIZE}
                            onToggle={() => {
                                setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
                            }}
                        >
                            <VersionsSummary />
                        </CollapsibleSection>

                        <CollapsibleSection
                            name="Details"
                            className={b('details')}
                            collapsed={false}
                            size={UI_COLLAPSIBLE_SIZE}
                        >
                            <WithStickyToolbar
                                topMargin="none"
                                toolbar={this.renderToolbar()}
                                content={
                                    <ElementsTable
                                        {...detailsTableProps}
                                        isLoading={initialLoading}
                                        items={details}
                                        templates={this.getDetailsTemplates()}
                                    />
                                }
                            />
                        </CollapsibleSection>
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
    };
};

const mapDispatchToProps = {
    changeHostFilter,
    changeVersionFilter,
    changeTypeFilter,
    changeStateFilter,
    changeBannedFilter,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(VersionsV2);
