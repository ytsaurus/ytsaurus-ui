import React from 'react';
import b from 'bem-cn-lite';
import {Button, type ButtonProps, Flex, Icon, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import './IncarnationButton.scss';

const block = b('incarnation-button');

type Props = {
    incarnationId: string;
    expanded: boolean;
} & ButtonProps;

export function IncarnationButton(props: Props) {
    const {incarnationId, ...restProps} = props;
    return (
        <Button {...restProps} view={'flat'} width={'max'} className={block()}>
            <Flex alignItems={'center'} gap={2} style={{height: '100%'}}>
                <Text variant={'subheader-2'}>{incarnationId}</Text>
                <Icon data={props.expanded ? ChevronUp : ChevronDown} size={'16'} />
            </Flex>
        </Button>
    );
}
