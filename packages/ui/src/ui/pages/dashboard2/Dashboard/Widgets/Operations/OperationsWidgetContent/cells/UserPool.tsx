import React from 'react';
import {useSelector} from '../../../../../../../store/redux-hooks';
import {Flex} from '@gravity-ui/uikit';

import {WidgetText} from '../../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';

import {getCluster} from '../../../../../../../store/selectors/global';

import {TemplatePools} from '../../../../../../../components/MetaTable/MetaTable';
import Icon from '../../../../../../../components/Icon/Icon';

type Props = {
    userPool: {
        user: string;
        pools: {tree: string; pool: string[]}[];
    };
};

export function UserPool(props: Props) {
    const {
        userPool: {user, pools},
    } = props;

    const cluster = useSelector(getCluster);

    return (
        <Flex direction={'column'}>
            <Flex direction={'row'} title={'User'} gap={1} alignItems={'center'}>
                <Icon face={'solid'} awesome={'user'} />
                <WidgetText>{user}</WidgetText>
            </Flex>
            <Flex direction={'row'} gap={1} alignItems={'center'}>
                <Icon face={'solid'} awesome={'poll-people'} />
                {pools?.length > 1 ? (
                    `${pools?.length || 0}`
                ) : (
                    <TemplatePools
                        pools={[{tree: pools?.[0]?.tree, pool: pools?.[0]?.pool?.[0]}]}
                        cluster={cluster}
                        compact
                    />
                )}
            </Flex>
        </Flex>
    );
}
