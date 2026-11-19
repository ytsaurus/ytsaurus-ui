import React, {type ReactNode, useMemo} from 'react';
import cn from 'bem-cn-lite';

import {Flex, HelpMark, Text} from '@gravity-ui/uikit';

import ypath from '../../common/thor/ypath';
import {ClickableText} from '../../components/ClickableText/ClickableText';
import {showErrorPopup, unescapeSlashX} from '../../utils/utils';
import {normalizeError} from '../../utils/normalize-error';
import i18n from './i18n';

const block = cn('yt-error-inline');

export type YTErrorInlineProps = {
    className?: string;
    error?: unknown;
    message?: ReactNode;
    type?: 'alert' | 'error' | 'info';
    hint?: ReactNode;
};

export function YTErrorInline({
    className,
    error: rawError,
    message,
    type,
    hint,
}: YTErrorInlineProps) {
    const error = useMemo(() => normalizeError(rawError), [rawError]);
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
            <Flex alignItems="baseline" shrink={0} gap={1}>
                <ClickableText
                    className={block('details')}
                    onClick={() => {
                        showErrorPopup(error, {type});
                    }}
                >
                    {''}
                    {i18n('action_details')}
                </ClickableText>
                {hint && (
                    <HelpMark aria-label={typeof hint === 'string' ? hint : i18n('action_details')}>
                        {hint}
                    </HelpMark>
                )}
            </Flex>
        </Flex>
    );
}
