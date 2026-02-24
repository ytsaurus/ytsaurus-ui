import {ypath} from '../../../utils';
import {Template} from '../templates/Template';
import {makeTTLItems} from './ttl';
import {YtComponentsConfig} from '../../../context';
import {MetaTableItem} from '../MetaTable';

const normalizeMetaOperationLinkItems = (
    result: MetaTableItem | MetaTableItem[] | null | undefined,
): MetaTableItem[] => {
    if (!result) return [];

    return Array.isArray(result) ? result : [result];
};

type Props = (
    attributes: any,
    cluster: string,
    config?: Partial<YtComponentsConfig>,
) => MetaTableItem[];

export const metaTablePresetMain: Props = (attributes, cluster, config = {}) => {
    const SubjectCard = config.SubjectCard;
    const AccountLink = config.AccountLink;
    const renderMetaOperationLink = config.renderMetaOperationLink ?? null;
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

    const operationLinkItems =
        yqlOpId && renderMetaOperationLink
            ? normalizeMetaOperationLinkItems(
                  renderMetaOperationLink({
                      operationId: yqlOpId,
                      cluster,
                  }),
              )
            : [];

    return [
        {
            key: 'id',
            value: <Template.Id id={id} />,
        },
        {
            key: 'owner',
            value: SubjectCard ? <SubjectCard name={owner} /> : owner,
            visible: Boolean(owner),
        },
        {
            key: 'account',
            value: AccountLink ? <AccountLink account={account} cluster={cluster} /> : account,
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
            cluster,
            config,
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
        ...operationLinkItems,
    ];
};
