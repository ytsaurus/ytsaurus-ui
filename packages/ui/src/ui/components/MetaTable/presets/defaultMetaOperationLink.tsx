import React from 'react';
import {Flex, Icon, Label, Link} from '@gravity-ui/uikit';
import AbbrSqlIcon from '@gravity-ui/icons/svgs/abbr-sql.svg';
import {type MetaTableItem, type MetaTableOperationLinkParams} from '@ytsaurus/components';
import UIFactory from '../../../UIFactory';
import {Markdown} from '../../Markdown/Markdown';
import {isQueryTrackerId} from './helpers/isQueryTrackerId';

function renderDefaultQueryTrackerOperationLink(operationId: string, cluster: string) {
    return (
        <Link href={`/${cluster}/queries/${operationId}`} target="_blank">
            <Flex alignItems="center" gap={1}>
                <Label theme="info">
                    <Flex alignItems="center" justifyContent="center">
                        <Icon data={AbbrSqlIcon} size={16} />
                    </Flex>
                </Label>
                {operationId}
            </Flex>
        </Link>
    );
}

function renderDefaultYqlOperationLink(operationId: string) {
    const url = UIFactory.yqlWidgetSetup?.getYqlOperationUrl(operationId);

    return url ? <Markdown text={url} errorMode="inline" /> : null;
}

export function renderDefaultMetaOperationLink({
    operationId,
    cluster,
}: MetaTableOperationLinkParams): MetaTableItem | null {
    const isQt = isQueryTrackerId(operationId);
    const value = isQt
        ? renderDefaultQueryTrackerOperationLink(operationId, cluster)
        : renderDefaultYqlOperationLink(operationId);

    if (!value) {
        return null;
    }

    return {
        key: isQt ? 'QT operation' : 'YQL operation',
        value,
        visible: true,
    };
}
