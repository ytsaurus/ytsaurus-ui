import React from 'react';
import {ClipboardButton, Flex, Text} from '@gravity-ui/uikit';

import format from '../../../../../common/hammer/format';

import Link from '../../../../../components/Link/Link';

type Props = {
    name?: string;
    url?: string;
    copy?: boolean;
    startIcon?: React.ReactNode;
};

export function GeneralCell(props: Props) {
    const {copy, name, url, startIcon} = props;
    return (
        <Flex style={{marginLeft: '-5px'}} direction={'row'} alignItems={'center'} gap={1}>
            {copy && <ClipboardButton text={name || format.NO_VALUE} />}
            {startIcon && <span style={{flexShrink: 0}}>{startIcon}</span>}
            <Text whiteSpace={'nowrap'} ellipsis>
                <Link url={url} theme={'primary'} routed>
                    {name || format.NO_VALUE}
                </Link>
            </Text>
        </Flex>
    );
}
