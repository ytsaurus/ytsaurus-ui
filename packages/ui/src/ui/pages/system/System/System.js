import React, {Component, Fragment} from 'react';

import SchedulersAndAgents from '../SchedulersAndAgents/SchedulersAndAgents';
import Resources from '../Resources/Resources';
import Masters from '../Masters/Masters';
import Chunks from '../Chunks/Chunks';
import Proxies from '../Proxies/Proxies';
import RpcProxies from '../RpcProxy/RpcProxy';
import Nodes from '../Nodes/Nodes';

import './System.scss';

const CONTAINER_PADDING = 50;

export default class System extends Component {
    container = React.createRef();

    renderContent() {
        const containerWidth = this.container.current
            ? this.container.current.clientWidth - CONTAINER_PADDING * 2
            : undefined;

        return (
            <Fragment>
                <Resources />
                <Masters />
                <SchedulersAndAgents />
                <Chunks />
                <Proxies />
                <RpcProxies />
                <Nodes containerWidth={containerWidth} collapsed={false} />
            </Fragment>
        );
    }

    render() {
        return (
            <div className="elements-page__content">
                <div className={'elements-main-section system'} ref={this.container}>
                    {this.renderContent()}
                </div>
            </div>
        );
    }
}
