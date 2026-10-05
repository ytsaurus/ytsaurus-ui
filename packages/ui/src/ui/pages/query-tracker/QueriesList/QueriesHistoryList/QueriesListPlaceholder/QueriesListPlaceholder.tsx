import React from 'react';
import {Flex, Loader} from '@gravity-ui/uikit';
import {NoContent} from '@ytsaurus/components';
import block from 'bem-cn-lite';

import i18n from './i18n';
import './QueriesListPlaceholder.scss';

const b = block('yt-queries-list-placeholder');

type Props = {
    loading: boolean;
    hasLoaded: boolean;
};

export function QueriesListPlaceholder({loading, hasLoaded}: Props) {
    if (!loading && !hasLoaded) {
        return null;
    }

    return (
        <Flex alignItems="center" justifyContent="center" className={b()}>
            {loading ? (
                <Loader />
            ) : (
                <NoContent
                    vertical
                    warning={i18n('title_empty')}
                    hint={i18n('context_empty-hint')}
                />
            )}
        </Flex>
    );
}
