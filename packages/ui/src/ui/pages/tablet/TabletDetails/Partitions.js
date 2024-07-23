import {Sticky, StickyContainer} from 'react-sticky';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import hammer from '../../../common/hammer';
import PropTypes from 'prop-types';
import unipika from '../../../common/thor/unipika';
import cn from 'bem-cn-lite';

import keys_ from 'lodash/keys';

import {Button} from '@gravity-ui/uikit';

import ClickableAttributesButton from '../../../components/AttributesButton/ClickableAttributesButton';
import ElementsTable from '../../../components/ElementsTable/ElementsTable';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import RadioButton from '../../../components/RadioButton/RadioButton';
import {FormattedText} from '../../../components/formatters';
import Label from '../../../components/Label/Label';

import {TABLET_PARTITIONS_TABLE_ID} from '../../../constants/tablet';
import {changeContentMode} from '../../../store/actions/tablet/tablet';
import {getPartitions} from '../../../store/selectors/tablet/tablet';
import {partitionsTableItems} from '../../../utils/tablet/table';
import {HEADER_HEIGHT} from '../../../constants/index';
import StoresDialog from './StoresDialog';

const headingBlock = cn('elements-heading');

class Partitions extends Component {
    static propTypes = {
        // from parent
        block: PropTypes.func.isRequired,

        // from connect
        contentMode: PropTypes.string.isRequired,
        partitions: PropTypes.array.isRequired,
        tabletPath: PropTypes.string,

        changeContentMode: PropTypes.func.isRequired,
    };

    static renderIndex(item, columnName) {
        const index = partitionsTableItems[columnName].get(item);

        if (index === -1) {
            return 'Eden';
        } else if (index === -2) {
            return 'Aggregation';
        } else {
            return hammer.format['Number'](index);
        }
    }

    static renderState(item, columnName) {
        const state = partitionsTableItems[columnName].get(item);
        const theme = {
            normal: 'success',
            splitting: 'warning',
            merging: 'warning',
            compacting: 'warning',
            sampling: 'warning',
            partitioning: 'warning',
        }[state];

        return typeof state !== 'undefined' ? (
            <Label theme={theme} text={state} />
        ) : (
            hammer.format.NO_VALUE
        );
    }

    static renderAsBytes(item, columnName) {
        const data = partitionsTableItems[columnName].get(item);
        return hammer.format['Bytes'](data);
    }

    static renderAsNumber(item, columnName) {
        const data = partitionsTableItems[columnName].get(item);
        return hammer.format['Number'](data);
    }

    static renderPivotKey(item, columnName) {
        const pivotKey = partitionsTableItems[columnName].get(item);
        const unipikaClassName = 'unipika-wrapper unipika-wrapper_inline_yes';
        const unipikaSettings = {break: false, indent: 0};
        const text = unipika.prettyprint(pivotKey, unipikaSettings);
        const title = unipika.prettyprint(pivotKey, {
            ...unipikaSettings,
            asHTML: false,
        });

        return typeof pivotKey !== 'undefined' ? (
            <FormattedText asHTML className={unipikaClassName} text={text} title={title} />
        ) : (
            hammer.format.NO_VALUE
        );
    }

    state = {
        stores: {},
    };

    renderStores = (item) => {
        const storeCount = item.storeCount;
        const partitionIndex = item.index;
        const onClick = () => this.handleShowStores(item);

        return (
            <span>
                {partitionIndex >= -1 && storeCount > 0 && (
                    <Button view="flat-secondary" size="m" onClick={onClick}>
                        View
                    </Button>
                )}
                {hammer.format['Number'](storeCount)}
            </span>
        );
    };

    renderActions = (item) => {
        const {tabletPath} = this.props;
        const partitionIndex = item.index;
        const path =
            tabletPath + (partitionIndex === -1 ? '/eden' : '/partitions/' + partitionIndex);

        return (
            partitionIndex >= -1 && (
                <ClickableAttributesButton
                    title={String(partitionIndex)}
                    exactPath={path}
                    withTooltip
                />
            )
        );
    };

    get tableSets() {
        return {
            default: {
                items: [
                    'index',
                    'state',
                    'unmerged_row_count',
                    'uncompressed_data_size',
                    'compressed_data_size',
                    'store_count',
                    'sample_key_count',
                    'actions',
                ],
            },
            keys: {
                items: ['index', 'pivot_key', 'actions'],
            },
        };
    }

    get tableSettings() {
        const {contentMode, block} = this.props;

        return {
            css: block(),
            theme: 'light',
            cssHover: true,
            striped: false,
            tableId: TABLET_PARTITIONS_TABLE_ID,
            columns: {
                items: partitionsTableItems,
                sets: this.tableSets,
                mode: contentMode,
            },
            templates: {
                index: Partitions.renderIndex,
                state: Partitions.renderState,
                unmerged_row_count: Partitions.renderAsNumber,
                uncompressed_data_size: Partitions.renderAsBytes,
                compressed_data_size: Partitions.renderAsBytes,
                store_count: this.renderStores,
                sample_key_count: Partitions.renderAsNumber,
                pivot_key: Partitions.renderPivotKey,
                actions: this.renderActions,
            },
            computeKey(tablet) {
                return tablet.index;
            },
            itemMods(tablet) {
                if (tablet.index === -1) {
                    return {
                        eden: 'yes',
                    };
                } else if (tablet.index === -2) {
                    return {
                        aggregation: 'yes',
                    };
                }
            },
        };
    }

    handleModeChange = (evt) => this.props.changeContentMode(evt.target.value);
    handleCloseStores = () => this.setState({stores: {}});
    handleShowStores = (stores) => this.setState({stores});

    renderStoresDialog() {
        const visible = keys_(this.state.stores).length > 0;

        if (!visible) {
            return null;
        }

        const {block, unorderedDynamicTable} = this.props;
        const {stores, index} = this.state.stores;

        return (
            <StoresDialog
                unorderedDynamicTable={unorderedDynamicTable}
                block={block}
                stores={stores}
                index={index}
                visible={true}
                onClose={this.handleCloseStores}
            />
        );
    }

    renderTableOverview() {
        const {contentMode, block} = this.props;

        return (
            <Sticky topOffset={-HEADER_HEIGHT}>
                {({isSticky}) => (
                    <div
                        className={block('table-overview', {
                            sticky: isSticky,
                        })}
                    >
                        <RadioButton
                            size="m"
                            value={contentMode}
                            onChange={this.handleModeChange}
                            name="tablet-partitions-content-mode"
                            items={[
                                {value: 'default', text: 'Default'},
                                {value: 'keys', text: 'Keys'},
                            ]}
                        />
                    </div>
                )}
            </Sticky>
        );
    }

    renderPartitions() {
        const {partitions} = this.props;

        return (
            <ErrorBoundary>
                <div className={headingBlock({size: 'm'})}>Partitions</div>

                <StickyContainer>
                    {this.renderTableOverview()}

                    <ElementsTable {...this.tableSettings} items={partitions} />
                </StickyContainer>
            </ErrorBoundary>
        );
    }

    render() {
        const {block, unorderedDynamicTable} = this.props;

        return (
            <div className={block('partitions')}>
                {unorderedDynamicTable ? null : this.renderPartitions()}
                {this.renderStoresDialog()}
            </div>
        );
    }
}

const mapDispatchToProps = {
    changeContentMode,
};

const mapStateToProps = (state) => {
    const {contentMode, tabletPath, unorderedDynamicTable} = state.tablet.tablet;
    const partitions = getPartitions(state);

    return {contentMode, tabletPath, partitions, unorderedDynamicTable};
};

export default connect(mapStateToProps, mapDispatchToProps)(Partitions);
