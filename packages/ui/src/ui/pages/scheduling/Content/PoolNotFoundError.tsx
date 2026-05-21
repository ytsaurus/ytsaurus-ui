import React from 'react';
import {Flex} from '@gravity-ui/uikit';
import {NoContent} from '@ytsaurus/components';
import i18n from './i18n';

export const PoolNotFoundError = ({poolName}: {poolName?: string}) => {
    const warningText = i18n('pool_not_found', {poolName});
    const hintText = i18n('pool_not_found_hint', {poolName});

    return (
        <Flex justifyContent="center" grow={1}>
            <NoContent warning={warningText} padding="large" hint={hintText} />
        </Flex>
    );
};
