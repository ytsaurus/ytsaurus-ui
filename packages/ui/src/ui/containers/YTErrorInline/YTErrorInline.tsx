import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Text} from '@gravity-ui/uikit';

import {YTError} from '../../types';

import ypath from '../../common/thor/ypath';
import {YTErrorBlockProps} from '../../components/Block/Block';
import {ClickableText} from '../../components/ClickableText/ClickableText';
import {showErrorPopup, unescapeSlashX} from '../../utils/utils';

const block = cn('yt-error-inline');

export type YTErrorInlineProps = Pick<
    YTErrorBlockProps,
    'className' | 'error' | 'message' | 'type'
>;

export function YTErrorInline({className, error, message, type}: YTErrorInlineProps) {
    let msg = message;
    if (!msg) {
        msg = ypath.getValue(error, '/message');
        if ('string' === typeof msg) {
            msg = unescapeSlashX(msg);
        }
    }
    return (
        <Flex className={className} alignItems="baseline" overflow="hidden" inline gap={1}>
            <Flex overflow="hidden" alignItems="baseline" shrink={1}>
                <Text variant="inherit" color={type === 'alert' ? 'warning' : 'danger'} ellipsis>
                    {msg}
                </Text>
            </Flex>
            <Flex alignItems="baseline" shrink={0}>
                <ClickableText
                    className={block('details')}
                    onClick={() => {
                        showErrorPopup(error as YTError, {type});
                    }}
                >
                    {''}
                    Details
                </ClickableText>
            </Flex>
        </Flex>
    );
}
