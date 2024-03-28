import React, {FC} from 'react';
import Resources from '../Resources/Resources';
import Masters from '../Masters/Masters';
import SchedulersAndAgents from '../SchedulersAndAgents/SchedulersAndAgents';
import Chunks from '../Chunks/Chunks';
import Proxies from '../Proxies/Proxies';
import RpcProxies from '../RpcProxies/RpcProxies';
import Nodes from '../Nodes/Nodes';

export const SystemGeneralTab: FC = () => {
    return (
        <>
            <Resources />
            <Masters />
            <SchedulersAndAgents />
            <Chunks />
            <Proxies />
            <RpcProxies />
            <Nodes />
        </>
    );
};
