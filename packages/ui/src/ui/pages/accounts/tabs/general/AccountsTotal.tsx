import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import hammer from '../../../../common/hammer';
import block from 'bem-cn-lite';

import map_ from 'lodash/map';

import {Flex, Progress} from '@gravity-ui/uikit';

import WarningIcon from '../../../../components/WarningIcon/WarningIcon';
import {
    type ClusterTotalsUsage,
    type NodesData,
    getDiskSpace,
    getNodesChunksTotals,
} from '../../../../utils/accounts/accountsTotal';
import {type TooltipInfoItem} from '../../../../utils/diskSpaceProgress';
import i18n from './i18n';
import {Tooltip} from '@ytsaurus/components';
import {ColorCircle} from '../../../../components/ColorCircle/ColorCircle';
import {MetaTable, type MetaTableItem} from '@ytsaurus/components';

const b = block('accounts');

interface Props {
    accounts: unknown[];
    clusterTotalsUsage: ClusterTotalsUsage;
    nodesData: NodesData;
    mediumList: string[];
    systemReservedDiskSpacePerMedium?: Record<string, number>;
    uncommittedDiskSpacePerMedium?: Record<string, number>;
}

export default class AccountsTotal extends Component<Props> {
    static propTypes = {
        // from props
        accounts: PropTypes.array,
        clusterTotalsUsage: PropTypes.object,
        nodesData: PropTypes.object,
        mediumList: PropTypes.array,
        systemReservedDiskSpacePerMedium: PropTypes.object,
        uncommittedDiskSpacePerMedium: PropTypes.object,
    };

    renderTooltipContent(tooltipItems: TooltipInfoItem[]) {
        const items: MetaTableItem[] = tooltipItems.map((item) => {
            return {
                key: item.title || '',
                label: item.isTotal ? (
                    <span>{item.title}</span>
                ) : (
                    <Flex gap={2} alignItems="center">
                        <ColorCircle theme={item.theme} color={item.color} />
                        <span>{item.title}</span>
                    </Flex>
                ),
                value: item.value,
            };
        });

        return <MetaTable items={items} />;
    }

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
        const {
            accounts,
            clusterTotalsUsage,
            nodesData,
            mediumList,
            systemReservedDiskSpacePerMedium,
            uncommittedDiskSpacePerMedium,
        } = this.props;

        const diskSpace = getDiskSpace(
            accounts,
            clusterTotalsUsage,
            nodesData,
            mediumList,
            systemReservedDiskSpacePerMedium,
            uncommittedDiskSpacePerMedium,
        );

        return (
            <Fragment>
                <table>
                    <thead>
                        <tr>
                            <th className={b('disk-space-medium-type')}>{i18n('field_medium')}</th>
                            <th
                                className={b('disk-space-cluster-usage')}
                                title={i18n('context_used-limit')}
                            >
                                {i18n('field_cluster-disk-space')}
                            </th>
                            <th className={b('disk-space-hardware-limit')}>
                                {i18n('field_hardware-limit')}
                            </th>
                            <th className={b('disk-space-label')} />
                            <th
                                className={b('disk-space-read-throughput')}
                                title={i18n('context_used-limit')}
                            >
                                {i18n('field_read-throughput')}
                            </th>
                            <th
                                className={b('disk-space-write-throughput')}
                                title={i18n('context_used-limit')}
                            >
                                {i18n('field_write-throughput')}
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
                                            <Tooltip
                                                className={b('disk-space-tooltip')}
                                                placement={'bottom'}
                                                content={this.renderTooltipContent(
                                                    item.clusterUsage.tooltipInfo,
                                                )}
                                            >
                                                <Progress
                                                    stack={item.clusterUsage.stack}
                                                    text={item.clusterUsage.text}
                                                />
                                            </Tooltip>
                                        </td>
                                        <td className={b('disk-space-hardware-limit')}>
                                            {hammer.format['Bytes'](item.hardwareLimit)}
                                        </td>
                                        <td className={b('disk-space-label')}>
                                            {item.overcommitted && (
                                                <WarningIcon
                                                    hoverContent={i18n('value_overcommitted')}
                                                />
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
