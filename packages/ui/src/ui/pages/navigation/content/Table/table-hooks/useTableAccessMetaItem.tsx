import {Lock} from '@gravity-ui/icons';
import {Flex} from '@gravity-ui/uikit';
import {Tooltip} from '@ytsaurus/components';
import compact_ from 'lodash/compact';
import React from 'react';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import Label from '../../../../../components/Label';
import {YTErrorInline} from '../../../../../containers/YTErrorInline/YTErrorInline';
import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {useCheckPermissionQuery} from '../../../../../store/api/yt/checkPermissions';
import {useGetQuery} from '../../../../../store/api/yt/get';
import UIFactory from '../../../../../UIFactory';
import i18n from './i18n';

type UseTableAccessMetaItemParams = {
    path: string;
    user: string;
    transaction_id?: string;
};

export function useTableAccessMetaItem({path, user, transaction_id}: UseTableAccessMetaItemParams) {
    const fullReadPermission = useCheckPermissionQuery({
        id: YTApiId.checkPermissions,
        parameters: {
            path,
            transaction_id,
            permission: 'full_read',
            user,
        },
    });
    const hasRls = useGetQuery<boolean>({
        id: YTApiId.checkPermissions,
        parameters: {transaction_id, path: `${path}/@has_row_level_ace`},
    });

    if (fullReadPermission.error || hasRls.error) {
        const error = {
            message: i18n('alert_failed-to-check-row-level-access'),
            inner_errors: compact_([fullReadPermission.error, hasRls.error]),
        };
        return {
            key: 'access',
            label: i18n('field_access'),
            value: <YTErrorInline error={error} />,
        };
    }

    const hasLimitedAccess = hasRls.data && fullReadPermission.data?.action === 'deny';
    if (!hasLimitedAccess) {
        return undefined;
    }

    return {
        key: 'access',
        label: i18n('field_access'),
        value: (
            <Label theme="warning">
                <Flex gap={1} alignItems="center">
                    <Lock />
                    <Tooltip
                        content={
                            <>
                                {i18n('context_row-level-access-limited')}{' '}
                                <HelpLink url={UIFactory.docsUrls['acl:row-level-security']} />,
                            </>
                        }
                    >
                        {i18n('value_limited')}
                    </Tooltip>
                </Flex>
            </Label>
        ),
    };
}
