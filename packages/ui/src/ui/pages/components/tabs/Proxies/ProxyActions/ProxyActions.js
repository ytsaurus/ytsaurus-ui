import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import {ProxyCard} from '../../../../../pages/components/tabs/Proxies/ProxyCard/ProxyCard';
import Button from '../../../../../components/Button/Button';
import Icon from '../../../../../components/Icon/Icon';

import {openChangeRoleModal} from '../../../../../store/actions/components/proxies/actions/change-role';
import {openBanModal, openUnbanModal} from '../../../../../store/actions/components/ban-unban';
import {PROXY_TYPE} from '../../../../../constants/components/proxies/proxies';
import {DropdownMenu} from '@gravity-ui/uikit';

class ProxyActions extends Component {
    static propTypes = {
        // from parent
        proxy: ProxyCard.proxyProps.isRequired,
        type: PropTypes.oneOf([PROXY_TYPE.HTTP, PROXY_TYPE.RPC]).isRequired,

        // from connect
        openBanModal: PropTypes.func.isRequired,
        openUnbanModal: PropTypes.func.isRequired,
        openChangeRoleModal: PropTypes.func.isRequired,
    };

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

    handleBanClick = () => {
        const {proxy, openBanModal} = this.props;

        openBanModal(proxy.host);
    };

    handleUnbanClick = () => {
        const {proxy, openUnbanModal} = this.props;

        openUnbanModal(proxy.host);
    };

    handleChangeRoleClick = () => {
        const {openChangeRoleModal, proxy} = this.props;

        openChangeRoleModal(proxy);
    };

    render() {
        const {proxy} = this.props;
        const icon = <Icon awesome="ellipsis-h" />;
        const button = (
            <Button view="flat-secondary" size="m">
                {icon}
            </Button>
        );

        return (
            <Fragment>
                <ClickableAttributesButton
                    title={proxy.host}
                    path={`${this.basePath}/${proxy.host}`}
                    withTooltip
                />

                {proxy.banned ? (
                    <Button
                        tooltipProps={this.tooltipProps}
                        onClick={this.handleUnbanClick}
                        view="flat-secondary"
                        size="m"
                        withTooltip
                    >
                        <Icon face="regular" awesome="undo" />
                    </Button>
                ) : (
                    <Button
                        tooltipProps={this.tooltipProps}
                        onClick={this.handleBanClick}
                        view="flat-secondary"
                        size="m"
                        withTooltip
                    >
                        <Icon face="regular" awesome="ban" />
                    </Button>
                )}

                <DropdownMenu
                    switcher={button}
                    popupPlacement={['bottom-end', 'top-end']}
                    items={[
                        {
                            text: 'Change role',
                            action: this.handleChangeRoleClick,
                        },
                    ]}
                />
            </Fragment>
        );
    }
}

const mapDispatchToProps = {
    openBanModal,
    openUnbanModal,
    openChangeRoleModal,
};

export default connect(null, mapDispatchToProps)(ProxyActions);
