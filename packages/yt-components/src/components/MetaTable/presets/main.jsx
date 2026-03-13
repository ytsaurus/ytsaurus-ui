import React from 'react';
import {ypath} from '../../../utils';
import {Template} from '../templates/Template';
import AccountLink from '../templates/AccountLink';
import {makeTTLItems} from './ttl';
import {Flex, Icon, Label, Link} from '@gravity-ui/uikit';
import AbbrSqlIcon from '@gravity-ui/icons/svgs/abbr-sql.svg';
import {isQueryTrackerId} from './helpers/isQueryTrackerId';

export default function metaTablePresetMain(attributes, cluster, config = {}) {
    const SubjectCard = config.SubjectCard ?? null;
    const renderYqlOperationLink = config.renderYqlOperationLink ?? null;
    const [id, owner, account, creationTime, modificationTime, accessTime, yqlOpId] =
        ypath.getValues(attributes, [
            '/id',
            '/owner',
            '/account',
            '/creation_time',
            '/modification_time',
            '/access_time',
            '/_yql_op_id',
        ]);

    const isQtOperation = isQueryTrackerId(yqlOpId);
    const yqlLink = yqlOpId ? renderYqlOperationLink(yqlOpId) : null;

    return [
        {
            key: 'id',
            value: <Template.Id id={id} />,
        },
        {
            key: 'owner',
            value: <SubjectCard name={owner} />,
        },
        {
            key: 'account',
            value: <AccountLink account={account} />,
            visible: Boolean(account),
        },
        {
            key: 'creation_time',
            value: <Template.Time time={creationTime} valueFormat="DateTime" />,
            visible: Boolean(creationTime),
        },
        ...makeTTLItems(attributes, {
            showTTLLabel: true,
            docsUrls: config.docsUrls,
        }),
        {
            key: 'modification_time',
            value: <Template.Time time={modificationTime} valueFormat="DateTime" />,
            visible: Boolean(modificationTime),
        },
        {
            key: 'access_time',
            value: <Template.Time time={accessTime} valueFormat="DateTime" />,
            visible: Boolean(accessTime),
        },
        {
            key: 'YQL operation',
            value: yqlLink,
            visible: Boolean(yqlLink) && !isQtOperation,
        },
        {
            key: 'QT operation',
            value: (
                <Link href={`/${cluster}/queries/${yqlOpId}`} target="_blank">
                    <Flex alignItems="center" gap={1}>
                        <Label theme="info">
                            <Flex alignItems="center" justifyContent="center">
                                <Icon data={AbbrSqlIcon} size={16} />
                            </Flex>
                        </Label>
                        {yqlOpId}
                    </Flex>
                </Link>
            ),
            visible: isQtOperation,
        },
    ];
}
