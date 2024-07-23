import React from 'react';
import cn from 'bem-cn-lite';

import compact_ from 'lodash/compact';

import Filter from '../../../components/Filter/Filter';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import BundlesTableModeRadio from '../../../pages/tablet_cell_bundles/bundles/BundlesTableModeRadio';
import type {setTabletsPartial} from '../../../store/actions/tablet_cell_bundles';
import type {BundlesTableMode} from '../../../store/reducers/tablet_cell_bundles';

import './BundlesTableInstruments.scss';

const block = cn('bundles-table-instruments');

export interface Props {
    className?: string;
}

class BundlesTableInstruments extends React.Component<Props & ReduxProps> {
    onNameEnterKeyDown = () => {
        this.props.setTabletsFirstBundleAsActive();
    };

    render() {
        const {
            accountFilter,
            bundlesTableMode,
            className,
            modes,
            nameFilter,
            setTabletsPartial,
            tagNodeFilter,
        } = this.props;

        return (
            <Toolbar
                className={block(null, className)}
                itemsToWrap={compact_([
                    {
                        name: 'name',
                        node: (
                            <Filter
                                className={block('text-filter')}
                                hasClear
                                autofocus
                                size="m"
                                type="text"
                                value={nameFilter}
                                placeholder="Enter bundle name..."
                                onChange={this.props.setTabletsBundlesNameFilter}
                                onEnterKeyDown={this.onNameEnterKeyDown}
                            />
                        ),
                        shrinkable: true,
                        growable: true,
                        wrapperClassName: block('item'),
                    },
                    {
                        name: 'account',
                        node: (
                            <Filter
                                className={block('account-filter')}
                                hasClear
                                size="m"
                                type="text"
                                value={accountFilter}
                                placeholder="Enter changelog or snapshot account..."
                                onChange={this.props.setTabletsBundlesAccountFilter}
                                autofocus={false}
                            />
                        ),
                        shrinkable: true,
                        growable: true,
                        wrapperClassName: block('item'),
                    },
                    {
                        name: 'tagNode',
                        node: (
                            <Filter
                                className={block('account-filter')}
                                hasClear
                                size="m"
                                type="text"
                                value={tagNodeFilter}
                                placeholder="Enter node tag filter..."
                                onChange={this.props.setTabletsBundlesTagNodeFilter}
                                autofocus={false}
                            />
                        ),
                        shrinkable: true,
                        growable: true,
                        wrapperClassName: block('item'),
                    },
                    (modes.length > 1 || modes[0] !== bundlesTableMode) && {
                        name: 'tableMode',
                        node: (
                            <BundlesTableModeRadio
                                bundlesTableMode={bundlesTableMode}
                                setTabletsPartial={setTabletsPartial}
                                modes={modes}
                            />
                        ),
                        shrinkable: false,
                        growable: false,
                        wrapperClassName: block('item'),
                    },
                ])}
            />
        );
    }
}

type ReduxProps = {
    accountFilter: string;
    bundlesTableMode: BundlesTableMode;
    modes: BundlesTableMode[];
    nameFilter: string;
    tagNodeFilter: string;
} & {
    setTabletsBundlesNameFilter(bundlesNameFilter: string): void;
    setTabletsBundlesAccountFilter(bundlesAccountFilter: string): void;
    setTabletsBundlesTagNodeFilter(bundlesTagNodeFilter: string): void;
    setTabletsFirstBundleAsActive(): void;
    setTabletsPartial: typeof setTabletsPartial;
};

export default BundlesTableInstruments;
