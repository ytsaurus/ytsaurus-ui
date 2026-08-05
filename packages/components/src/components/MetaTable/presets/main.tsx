import {ypath} from '../../../utils';
import {TemplateId, TemplateLink} from '../templates/Template';
import {TemplateTime} from '../templates/TemplateTime';
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
                      <TemplateLink
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
            value: <TemplateId id={id} />,
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
            value: <TemplateTime time={creationTime} valueFormat="DateTime" />,
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
            value: <TemplateTime time={modificationTime} valueFormat="DateTime" />,
            visible: Boolean(modificationTime),
        },
        {
            key: 'access_time',
            label: i18n('field_access-time'),
            value: <TemplateTime time={accessTime} valueFormat="DateTime" />,
            visible: Boolean(accessTime),
        },
        ...operationLinkItems,
        ...nirvanaMetaItems,
    ];
};
