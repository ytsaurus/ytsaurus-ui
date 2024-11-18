import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import cn from 'bem-cn-lite';
import isEmpty_ from 'lodash/isEmpty';

import hammer from '../../../../../common/hammer';

import {MaintenanceRequests} from '../../../../../components/MaintenanceRequests/MaintenanceRequests';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import Button from '../../../../../components/Button/Button';
import Label from '../../../../../components/Label/Label';
import Icon from '../../../../../components/Icon/Icon';

import {getCluster, getCurrentClusterConfig} from '../../../../../store/selectors/global';
import withSplit from '../../../../../hocs/withSplit';

import './ProxyCard.scss';
import UIFactory from '../../../../../UIFactory';
import {NodeColumnRole, NodeColumnState} from '../../NodeColumns';
import type {RootState} from '../../../../../store/reducers';
import {MaintenanceRequestInfo} from '../../../../../store/actions/components/node-maintenance-modal';

type ProxyProps = {
    banMessage: string;
    effectiveState: string;
    role: 'data' | 'default' | 'control';
    state: string;
    host: string;
    name: string;
    physicalHost: string;
    banned: boolean;
    version: string;
    maintenanceRequests: Record<string, MaintenanceRequestInfo>;

    updatedAt?: string;
    loadAverage?: number;
    networkLoad?: number;
};

type OwnProps = {
    proxy: ProxyProps;
    handleClose: () => void;
    isYpCluster: boolean;
};

type StateProps = ReturnType<typeof mapStateToProps>;

type ProxyCardProps = OwnProps & StateProps;

const block = cn('proxy-card');

export class ProxyCard extends Component<ProxyCardProps> {
    static proxyProps = PropTypes.shape({
        banMessage: PropTypes.string.isRequired,
        effectiveState: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        state: PropTypes.string.isRequired,
        host: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        physicalHost: PropTypes.string,
        banned: PropTypes.bool.isRequired,

        updatedAt: PropTypes.string,
        loadAverage: PropTypes.number,
        networkLoad: PropTypes.number,
    });

    static propTypes = {
        // from parent
        proxy: ProxyCard.proxyProps.isRequired,
        handleClose: PropTypes.func.isRequired,

        isYpCluster: PropTypes.bool.isRequired,
    };

    componentWillUnmount() {
        this.props.handleClose();
    }

    renderTop() {
        const {clusterConfig} = this.props;
        const {host, physicalHost} = this.props.proxy;
        return UIFactory.renderComponentsNodeCardTop({host, physicalHost, clusterConfig});
    }

    renderContent() {
        const {
            state,
            banned,
            banMessage,
            role,
            loadAverage,
            networkLoad,
            version,
            updatedAt,
            maintenanceRequests,
        } = this.props.proxy;

        return (
            <MetaTable
                items={[
                    {
                        key: 'state',
                        value: <NodeColumnState state={state} />,
                    },
                    {
                        key: 'role',
                        value: <NodeColumnRole role={role} />,
                    },
                    {
                        key: 'Banned',
                        value: (
                            <Label
                                text={banMessage || 'True'}
                                theme={banMessage ? 'warning' : 'danger'}
                                type="text"
                            />
                        ),
                        visible: Boolean(banned),
                    },
                    {
                        key: 'Maintenance',
                        value: <MaintenanceRequests requests={maintenanceRequests} />,
                        visible: !isEmpty_(maintenanceRequests),
                    },
                    {
                        key: 'version',
                        value: version,
                    },
                    {
                        key: 'load average',
                        value: loadAverage,
                        visible: Boolean(loadAverage),
                    },
                    {
                        key: 'network load',
                        value: networkLoad,
                        visible: Boolean(networkLoad),
                    },
                    {
                        key: 'updated at',
                        value: hammer.format['DateTime'](updatedAt),
                        visible: Boolean(updatedAt),
                    },
                ]}
            />
        );
    }

    render() {
        const {proxy, handleClose} = this.props;

        return (
            proxy && (
                <div className={block()}>
                    <div className={block('header')}>
                        <h3 className={block('proxy')}>{proxy.host}</h3>

                        <Button view="flat-secondary" size="m" onClick={handleClose}>
                            <Icon awesome="times" face={'light'} />
                        </Button>
                    </div>

                    {this.renderTop()}
                    {this.renderContent()}
                </div>
            )
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        cluster: getCluster(state),
        clusterConfig: getCurrentClusterConfig(state),
    };
};

const connector = connect(mapStateToProps);

export default compose(connector, withSplit)(ProxyCard);
