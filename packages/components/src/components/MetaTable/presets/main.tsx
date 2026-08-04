import {ypath} from '../../../utils';
import {Template} from '../templates/Template';
import {makeTTLItems} from './ttl';
import type {TYComponentsNavigationMetaConfig} from '../../../types';
import {MetaTableItem} from '../MetaTable';
import i18n from './i18n';

const LINK_MAX_WIDTH = '50ch';

const normalizeMetaTableItems = (
    result: MetaTableItem | MetaTableItem[] | null | undefined,
): MetaTableItem[] => {
    if (!result) return [];

    return Array.isArray(result) ? result : [result];
};

type Props = (
    attributes: any,
    cluster: string,
    config?: TYComponentsNavigationMetaConfig,
) => MetaTableItem[];

export const metaTablePresetMain: Props = (attributes, cluster, config = {}) => {
    const {SubjectCard, AccountLink, renderMetaOperationLink, renderMarkdown} = config;
    const [
        id,
        owner,
        account,
        creationTime,
        modificationTime,
        accessTime,
        yqlOpId,
        nirvanaBlockUrl,
    ] = ypath.getValues(attributes, [
        '/id',
        '/owner',
        '/account',
        '/creation_time',
        '/modification_time',
        '/access_time',
        '/_yql_op_id',
        '/_nirvana_meta/block_url',
    ]);

    const operationLinkItems =
        yqlOpId && renderMetaOperationLink
            ? normalizeMetaTableItems(
                  renderMetaOperationLink({
                      operationId: yqlOpId,
                      cluster,
                  }),
              )
            : [];

    const nirvanaMetaItems = nirvanaBlockUrl
        ? [
              {
                  key: 'nirvana_block_url',
                  value: renderMarkdown ? (
                      renderMarkdown({text: nirvanaBlockUrl})
                  ) : (
                      <Template.Link
                          url={nirvanaBlockUrl}
                          text={nirvanaBlockUrl}
                          maxWidth={LINK_MAX_WIDTH}
                          withClipboard
                      />
                  ),
              },
          ]
        : [];

    return [
        {
            key: 'id',
            label: i18n('field_id'),
            value: <Template.Id id={id} />,
        },
        {
            key: 'owner',
            label: i18n('field_owner'),
            value: SubjectCard ? <SubjectCard name={owner} /> : owner,
            visible: Boolean(owner),
        },
        {
            key: 'account',
            label: i18n('field_account'),
            value: AccountLink ? <AccountLink account={account} cluster={cluster} /> : account,
            visible: Boolean(account),
        },
        {
            key: 'creation_time',
            label: i18n('field_creation-time'),
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
            label: i18n('field_modification-time'),
            value: <Template.Time time={modificationTime} valueFormat="DateTime" />,
            visible: Boolean(modificationTime),
        },
        {
            key: 'access_time',
            label: i18n('field_access-time'),
            value: <Template.Time time={accessTime} valueFormat="DateTime" />,
            visible: Boolean(accessTime),
        },
        ...operationLinkItems,
        ...nirvanaMetaItems,
    ];
};
