import React from 'react';
import cn from 'bem-cn-lite';

import filter_ from 'lodash/filter';

import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import Filter from '../../../components/Filter/Filter';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import Suggest from '../../../components/Suggest/Suggest';
import type {TabletsPartialAction} from '../../../store/reducers/tablet_cell_bundles';

import './CellsInstruments.scss';

const block = cn('cells-table-instruments');

export interface Props {
    className?: string;
}

class CellsTableInstruments extends React.Component<Props & ReduxProps> {
    onIdFilter = (id: string) => {
        this.props.setTabletsPartial({cellsIdFilter: id});
    };

    onBundleFilter = (bundle: string) => {
        this.props.setTabletsPartial({cellsBundleFilter: bundle});
    };

    onHostFilterChange = (hostFilter: string) => {
        this.onHostSelected(hostFilter);
    };

    onHostSelected = (host: string) => {
        this.props.setTabletsPartial({cellsHostFilter: host});
    };

    onHostInputBlur = () => {
        this.setState({hostFilter: this.props.hostFilter});
    };

    getBundleFilterItems = (text?: string) => {
        const {bundles} = this.props;
        if (!text) {
            return bundles;
        }
        return filter_(bundles, (bundle = '') => bundle.indexOf(text) !== -1);
    };

    getHostFilterItems = (text?: string) => {
        const {hosts} = this.props;
        if (!text) {
            return hosts;
        }
        return filter_(hosts, (host = '') => host.indexOf(text) !== -1);
    };

    render() {
        const {className, idFilter, bundleFilter, activeBundle, activeBundleHosts} = this.props;

        return (
            <Toolbar
                className={block(null, className)}
                itemsToWrap={[
                    {
                        name: 'id1',
                        node: (
                            <Filter
                                className={block('text-filter')}
                                hasClear
                                size="m"
                                type="text"
                                value={idFilter}
                                placeholder="Enter cell id..."
                                onChange={this.onIdFilter}
                                autofocus={false}
                            />
                        ),
                        shrinkable: true,
                        growable: true,
                        wrapperClassName: block('item'),
                    },
                    ...(!activeBundle
                        ? [
                              {
                                  name: 'bundle',
                                  node: (
                                      <Suggest
                                          className={block('suggest')}
                                          text={bundleFilter}
                                          apply={(item) =>
                                              this.onBundleFilter(
                                                  'string' === typeof item ? item : item.value,
                                              )
                                          }
                                          filter={(_items, filter) =>
                                              this.getBundleFilterItems(filter)
                                          }
                                          placeholder={'Enter bundle name...'}
                                          popupClassName={block('suggest-popup')}
                                      />
                                  ),
                                  growable: true,
                                  shrinkable: true,
                                  wrapperClassName: block('item'),
                              },
                          ]
                        : []),
                    {
                        name: 'host',
                        node: (
                            <Suggest
                                className={block('suggest')}
                                text={this.props.hostFilter}
                                onTextUpdate={this.onHostFilterChange}
                                onItemClick={(item) =>
                                    this.onHostSelected(
                                        'string' === typeof item ? item : item.value,
                                    )
                                }
                                onBlur={this.onHostInputBlur}
                                filter={(_items, filter = '') => this.getHostFilterItems(filter)}
                                placeholder={'Enter host...'}
                                autoFocus={false}
                                popupClassName={block('suggest-popup')}
                            />
                        ),
                        growable: true,
                        shrinkable: true,
                        wrapperClassName: block('item'),
                    },
                    ...(activeBundleHosts
                        ? [
                              {
                                  name: 'copy-hosts',
                                  node: (
                                      <ClipboardButton
                                          pin="round"
                                          text={activeBundleHosts}
                                          awesome="clipboard-list"
                                          buttonText="Copy host list"
                                      />
                                  ),
                              },
                          ]
                        : []),
                ]}
            />
        );
    }
}

export type ReduxProps = {
    activeBundle: string;
    activeBundleHosts: string;
    idFilter: string;
    bundleFilter: string;
    hostFilter: string;
    bundles: string[];
    hosts: string[];
} & {
    setTabletsPartial(data: TabletsPartialAction['data']): void;
};

export default CellsTableInstruments;
