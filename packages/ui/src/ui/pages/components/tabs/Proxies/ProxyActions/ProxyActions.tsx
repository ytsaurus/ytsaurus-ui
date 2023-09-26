import React from 'react';
import {ConnectedProps, connect} from 'react-redux';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import Button from '../../../../../components/Button/Button';
import Icon from '../../../../../components/Icon/Icon';

import {PROXY_TYPE} from '../../../../../constants/components/proxies/proxies';
import {showNodeMaintenance} from '../../../../../store/actions/components/node-maintenance-modal';

type ReduxProps = ConnectedProps<typeof connector>;

type Props = {
    type: 'http_proxy' | 'rpc_proxy';
    proxy: {host: string; banned: boolean};
};

class ProxyActions extends React.Component<ReduxProps & Props> {
    get tooltipProps() {
        const {proxy} = this.props;

        return {
            placement: 'bottom',
            content: proxy.banned ? 'Unban proxy' : 'Ban proxy',
        };
    }

    get basePath() {
        const {type} = this.props;

        return type === PROXY_TYPE.HTTP ? '//sys/http_proxies' : '//sys/rpc_proxies';
    }

    handleEditClick = () => {
        const {proxy, type} = this.props;
        this.props.showNodeMaintenance({
            address: proxy.host,
            component: type === PROXY_TYPE.HTTP ? 'http_proxy' : 'rpc_proxy',
        });
    };

    render() {
        const {proxy} = this.props;

        return (
            <React.Fragment>
                <ClickableAttributesButton
                    title={proxy.host}
                    path={`${this.basePath}/${proxy.host}`}
                    withTooltip
                />
                <Button onClick={this.handleEditClick} view="flat-secondary" size="m" withTooltip>
                    <Icon face="regular" awesome="pencil" />
                </Button>
            </React.Fragment>
        );
    }
}

const mapDispatchToProps = {
    showNodeMaintenance,
};

const connector = connect(null, mapDispatchToProps);

export default connector(ProxyActions);
