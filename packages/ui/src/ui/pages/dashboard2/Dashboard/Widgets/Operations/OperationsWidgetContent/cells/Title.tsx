import React from 'react';
import {useSelector} from 'react-redux';

import {ClipboardButton, Flex, Text} from '@gravity-ui/uikit';

import {getCluster} from '../../../../../../../store/selectors/global';

import Link from '../../../../../../../components/Link/Link';

import {Page} from '../../../../../../../../shared/constants/settings';

export function Title({title: {title, id}}: {title: {title: string; id: string}}) {
    const cluster = useSelector(getCluster);
    const url = `/${cluster}/${Page.OPERATIONS}/${id}/details`;
    return (
        <Flex direction={'row'} alignItems={'center'} gap={1}>
            <ClipboardButton text={title} />
            <Text whiteSpace={'nowrap'} ellipsis>
                <Link url={url} theme={'primary'} routed>
                    {title}
                </Link>
            </Text>
        </Flex>
    );
}
