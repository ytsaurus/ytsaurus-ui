import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

import Link from '../../../../../components/Link/Link';

import {Page} from '../../../../../../shared/constants/settings';

type Props = {
    title: string;
    count?: number;
    page?: keyof typeof Page;
    isLoading?: boolean;
};

export function WidgetHeader(props: Props) {
    const {title, count, page, isLoading} = props;

    return (
        <Flex direction={'row'} gap={2}>
            {page ? (
                <Link url={Page[page]} routed>
                    <Text variant={'subheader-3'} color={'primary'}>
                        {title}
                    </Text>
                </Link>
            ) : (
                <Text variant={'subheader-3'} color={'primary'}>
                    {title}
                </Text>
            )}
            {!isLoading && Boolean(count) && (
                <Text color={'secondary'} variant={'subheader-3'}>
                    {count}
                </Text>
            )}
        </Flex>
    );
}
