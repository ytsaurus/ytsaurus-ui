import React from 'react';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import {CircleExclamation} from '@gravity-ui/icons';

import Link from '../../../../../components/Link/Link';
import {YTError} from '../../../../../types';
import {showErrorModal} from '../../../../../store/actions/modals/errors';
import {useDispatch} from '../../../../../store/redux-hooks';

import {Page} from '../../../../../../shared/constants/settings';

import {WidgetText} from '../WidgetText/WidgetText';

type Props = {
    title: string;
    count?: number;
    page?: keyof typeof Page;
    isLoading?: boolean;
    id?: string;
    error?: YTError;
};

export function WidgetHeader(props: Props) {
    const {title, count, page, isLoading, id, error} = props;

    const dispatch = useDispatch();

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
            {error && (
                <Button
                    view={'flat'}
                    size={'s'}
                    onClick={() => dispatch(showErrorModal(error, {hideOopsMsg: true}))}
                >
                    <Flex alignItems={'center'} width={'100%'} height={'100%'}>
                        <CircleExclamation color={'var(--danger-color)'} />
                    </Flex>
                </Button>
            )}
        </Flex>
    );
}
