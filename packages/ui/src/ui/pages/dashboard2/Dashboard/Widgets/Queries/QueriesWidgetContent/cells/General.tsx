import React from 'react';
import {useSelector} from 'react-redux';
import {Flex, Text} from '@gravity-ui/uikit';

import {getCluster} from '../../../../../../../store/selectors/global';

import Link from '../../../../../../../components/Link/Link';
import {QueryStatusIcon} from '../../../../../../../components/QueryStatus';

import {Page} from '../../../../../../../../shared/constants/settings';
import {QueryStatus} from '../../../../../../../types/query-tracker';

type Props = {
    name: string;
    state: QueryStatus;
    id: string;
};

export function General({name, state, id}: Props) {
    const cluster = useSelector(getCluster);
    const url = `/${cluster}/${Page.QUERIES}/${id}`;
    return (
        <Flex direction={'row'} alignItems={'center'} gap={1}>
            <QueryStatusIcon status={state} />
            <Link url={url} theme={'primary'} routed>
                <Text>{name}</Text>
            </Link>
        </Flex>
    );
}
