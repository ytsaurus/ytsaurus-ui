import React, {type FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {ClipboardButton} from '@ytsaurus/components';

import i18n from './i18n';

const BUNDLE_SYSTEM_POSTFIX = '_bundle_system_quotas';

type Props = {
    accountName: string;
};

export const ResourceWarning: FC<Props> = ({accountName}) => {
    const showAlert = accountName.includes(BUNDLE_SYSTEM_POSTFIX);
    if (!showAlert) return null;

    const name = accountName.replace(BUNDLE_SYSTEM_POSTFIX, '');
    const path = `//sys/tablet_cell_bundles/${name}/@system_account_quota_multiplier`;

    return (
        <Flex direction="column" gap={2}>
            <Text>{i18n('context_system-account-quota')}</Text>
            <Text>{i18n('context_cluster-admin-edit-bundle')}</Text>
            <Flex gap={1} alignItems="center">
                <Text wordBreak="break-all">{path}</Text>
                <ClipboardButton text={path} size="s" />
            </Flex>
            <Text>{i18n('context_regular-user-contact-support')}</Text>
        </Flex>
    );
};
