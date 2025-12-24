import React from 'react';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {Template} from '../../../components/MetaTable/templates/Template';
import {SubjectCard} from '../../SubjectLink/SubjectLink';
import AccountLink from '../../../pages/accounts/AccountLink';
import UIFactory from '../../../UIFactory';
import {makeTTLItems} from './ttl';
import {Flex, Icon, Label, Link} from '@gravity-ui/uikit';
import AbbrSqlIcon from '@gravity-ui/icons/svgs/abbr-sql.svg';
import {isQueryTrackerId} from './helpers/isQueryTrackerId';

export default function metaTablePresetMain(attributes, cluster) {
    const [id, owner, account, creationTime, modificationTime, accessTime, yql_op_id] =
        ypath.getValues(attributes, [
            '/id',
            '/owner',
            '/account',
            '/creation_time',
            '/modification_time',
            '/access_time',
            '/_yql_op_id',
        ]);

    const isQtOperation = isQueryTrackerId(yql_op_id);
    const yqlLink = yql_op_id ? UIFactory.yqlWidgetSetup?.renderYqlOperationLink(yql_op_id) : null;

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
        ...makeTTLItems(attributes, {showTTLLabel: true}),
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
                <Link href={`/${cluster}/queries/${yql_op_id}`} target="_blank">
                    <Flex alignItems="center" gap={1}>
                        <Label theme="info">
                            <Flex alignItems="center" justifyContent="center">
                                <Icon data={AbbrSqlIcon} size={16} />
                            </Flex>
                        </Label>
                        {yql_op_id}
                    </Flex>
                </Link>
            ),
            visible: isQtOperation,
        },
    ];
}
