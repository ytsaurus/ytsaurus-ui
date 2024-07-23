import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import hammer from '../../../../common/hammer';
import block from 'bem-cn-lite';

import map_ from 'lodash/map';

import {Progress} from '@gravity-ui/uikit';

import WarningIcon from '../../../../components/WarningIcon/WarningIcon';
import {
    ClusterTotalsUsage,
    NodesData,
    getDiskSpace,
    getNodesChunksTotals,
} from '../../../../utils/accounts/accountsTotal';

const b = block('accounts');

interface Props {
    accounts: unknown[];
    clusterTotalsUsage: ClusterTotalsUsage;
    nodesData: NodesData;
    mediumList: string[];
}

export default class AccountsTotal extends Component<Props> {
    static propTypes = {
        // from props
        accounts: PropTypes.array,
        clusterTotalsUsage: PropTypes.object,
        nodesData: PropTypes.object,
        mediumList: PropTypes.array,
    };

    renderNodesChunksTotals() {
        const {clusterTotalsUsage} = this.props;

        return (
            <table>
                <tbody>
                    {map_(getNodesChunksTotals(clusterTotalsUsage), (item) => (
                        <tr key={item.name}>
                            <td className={b('disk-space-medium-type')}>
                                {hammer.format['ReadableField'](item.name)}
                            </td>
                            <td className={b('disk-space-cluster-usage')}>
                                <Progress
                                    value={item.clusterUsage.progress}
                                    text={item.clusterUsage.text}
                                    theme={'success'}
                                />
                            </td>
                            <td className={b('disk-space-hardware-limit')}>–</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    renderNewTotals() {
        const {accounts, clusterTotalsUsage, nodesData, mediumList} = this.props;
        const diskSpace = getDiskSpace(accounts, clusterTotalsUsage, nodesData, mediumList);

        return (
            <Fragment>
                <table>
                    <thead>
                        <tr>
                            <th className={b('disk-space-medium-type')}>Medium</th>
                            <th className={b('disk-space-cluster-usage')} title="used/limit">
                                Cluster Disk Space
                            </th>
                            <th className={b('disk-space-hardware-limit')}>Hardware Limit</th>
                            <th className={b('disk-space-label')} />
                            <th className={b('disk-space-read-throughput')} title="used/limit">
                                Read Throughput per sec
                            </th>
                            <th className={b('disk-space-write-throughput')} title="used/limit">
                                Write Throughput per sec
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {diskSpace.map(
                            (item) =>
                                (typeof item.show === 'undefined' || item.show) && (
                                    <tr key={item.mediumType}>
                                        <td className={b('disk-space-medium-type')}>
                                            {hammer.format['ReadableField'](item.mediumType)}
                                        </td>
                                        <td className={b('disk-space-cluster-usage')}>
                                            <Progress
                                                value={item.clusterUsage.progress}
                                                text={item.clusterUsage.text}
                                                theme={'success'}
                                            />
                                        </td>
                                        <td className={b('disk-space-hardware-limit')}>
                                            {hammer.format['Bytes'](item.hardwareLimit)}
                                        </td>
                                        <td className={b('disk-space-label')}>
                                            {item.overcommitted && (
                                                <WarningIcon hoverContent="Overcommitted" />
                                            )}
                                        </td>
                                        <td className={b('disk-space-read-throughput')}>
                                            {item.readThroughput.show ? (
                                                <Progress {...item.readThroughput.progress} />
                                            ) : (
                                                hammer.format.NO_VALUE
                                            )}
                                        </td>
                                        <td className={b('disk-space-write-throughput')}>
                                            {item.writeThroughput.show ? (
                                                <Progress {...item.writeThroughput.progress} />
                                            ) : (
                                                hammer.format.NO_VALUE
                                            )}
                                        </td>
                                    </tr>
                                ),
                        )}
                    </tbody>
                </table>
                <br />
                {this.renderNodesChunksTotals()}
            </Fragment>
        );
    }

    render() {
        return (
            <div className={b('disk-space')}>
                <div className={b('disk-space-table')}>{this.renderNewTotals()}</div>
            </div>
        );
    }
}
