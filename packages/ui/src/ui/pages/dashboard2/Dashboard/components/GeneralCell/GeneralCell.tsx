import React from 'react';
import {useDispatch} from 'react-redux';
import {Button, ClipboardButton, Flex, Text} from '@gravity-ui/uikit';
import {CircleExclamation} from '@gravity-ui/icons';

import format from '../../../../../common/hammer/format';

import Link from '../../../../../components/Link/Link';
import {YTError} from '../../../../../types';
import {showErrorModal} from '../../../../../store/actions/modals/errors';

type Props = {
    name?: string;
    url?: string;
    copy?: boolean;
    startIcon?: React.ReactNode;
    error?: YTError;
};

export function GeneralCell(props: Props) {
    const {copy, name, url, startIcon, error} = props;

    const dispatch = useDispatch();

    return (
        <Flex style={{marginLeft: '-5px'}} direction={'row'} alignItems={'center'} gap={1}>
            {copy && <ClipboardButton text={name || format.NO_VALUE} />}
            {startIcon && <span style={{flexShrink: 0}}>{startIcon}</span>}
            <Text whiteSpace={'nowrap'} ellipsis>
                <Link url={url} theme={'primary'} routed>
                    {name || format.NO_VALUE}
                </Link>
            </Text>
            {error && (
                <Button
                    view={'flat'}
                    size={'s'}
                    qa={'item-error'}
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
