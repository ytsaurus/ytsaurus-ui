import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

import Link from '../../../../../components/Link/Link';

import {Page} from '../../../../../../shared/constants/settings';

import {WidgetText} from '../WidgetText/WidgetText';

type Props = {
    title: string;
    count?: number;
    page?: keyof typeof Page;
    isLoading?: boolean;
    id?: string;
};

export function WidgetHeader(props: Props) {
    const {title, count, page, isLoading, id} = props;

    return (
        <Flex
            direction={'row'}
            alignItems={'center'}
            gap={2}
            qa={`${id}-header`}
            grow={2}
            minWidth={0}
        >
            {page ? (
                <WidgetText variant={'subheader-3'} color={'primary'}>
                    <Link theme={'primary'} url={Page[page]} routed>
                        {title}
                    </Link>
                </WidgetText>
            ) : (
                <WidgetText variant={'subheader-3'} color={'primary'}>
                    {title}
                </WidgetText>
            )}
            {!isLoading && Boolean(count) && (
                <Text color={'secondary'} variant={'subheader-3'} qa={`${id}-items-count`}>
                    {count}
                </Text>
            )}
        </Flex>
    );
}
