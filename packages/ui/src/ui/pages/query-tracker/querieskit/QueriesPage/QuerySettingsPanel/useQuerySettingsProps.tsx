import {getQuerySettingPermissions} from '../../../../../utils/query-tracker/settings';
import React, {useEffect, useState} from 'react';
import type {QuerySettingsSectionsProps} from '@gravity-ui/querieskit';
import {Flex, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectCurrentQuery,
    selectCurrentSecretIds,
    selectQueryDraft,
    selectQuerySessionRevision,
} from '../../../../../store/selectors/query-tracker/query';
import {selectIsSupportedQtACO} from '../../../../../store/selectors/query-tracker/queryAco';
import {selectAvailableSpytConnect} from '../../../../../store/selectors/query-tracker/queryTrackerEnginesInfo';
import {selectQueryTokens} from '../../../../../store/selectors/settings/settings-queries';
import {updateQueryDraft} from '../../../../../store/actions/query-tracker/query';
import {setQueryName} from '../../../../../store/actions/query-tracker/queryAnnotations';
import {QueryEngine} from '../../../../../../shared/constants/engines';
import {QueryACOSelect} from '../../../QueryACO/QueryACOSelect';
import {formValidator} from '../../../QuerySettingsButton/formValidator';
import {toaster} from '../../../../../utils/toaster';
import tokenI18n from '../../../QueryToken/QueryTokenButton/i18n';
import {applySettingsAttributes, getSettingsAttributes, settingsAttributeCodec} from './attributes';

export function useQuerySettingsProps(): QuerySettingsSectionsProps<unknown> {
    const dispatch = useDispatch();
    const {id, annotations, engine, settings} = useSelector(selectQueryDraft);
    const currentQuery = useSelector(selectCurrentQuery);
    const acoSupported = useSelector(selectIsSupportedQtACO);
    const spytConnect = useSelector(selectAvailableSpytConnect);
    const tokens = useSelector(selectQueryTokens);
    const tokenIds = useSelector(selectCurrentSecretIds);
    const [attributeState, setAttributeState] = useState<{
        scope: string;
        ids: Record<string, string>;
    }>({scope: '', ids: {}});
    const revision = useSelector(selectQuerySessionRevision);
    const scope = revision + ':' + engine;
    useEffect(() => setAttributeState({scope, ids: {}}), [scope]);
    const attributes = getSettingsAttributes(
        settings,
        attributeState.scope === scope ? attributeState.ids : {},
    );
    const setAttributeIds = (ids: Record<string, string>) => setAttributeState({scope, ids});
    return {
        mode: 'sections',
        general: {
            queryName: {
                value: annotations?.title || '',
                required: true,
                onChange: (title) =>
                    dispatch(updateQueryDraft({annotations: {...annotations, title}})),
                onBlur: () => {
                    if (
                        id &&
                        currentQuery?.id === id &&
                        currentQuery.annotations?.title !== annotations?.title
                    ) {
                        dispatch(setQueryName(id, annotations?.title)).catch((error) => {
                            toaster.add({
                                name: 'query-name',
                                theme: 'danger',
                                title: String(error.message || error),
                            });
                        });
                    }
                },
            },
            tokens: {
                value: tokenIds,
                items: tokens.map(({name}) => ({id: name, title: name})),
                onChange: (next) => {
                    dispatch(
                        updateQueryDraft({
                            secrets: tokens
                                .filter(({name}) => next.includes(name))
                                .map(({name, cluster, path}) => ({
                                    id: name,
                                    ypath: `${cluster}:${path}`,
                                })),
                        }),
                    );
                },
            },
            customFields: (
                <>
                    {acoSupported && <QueryACOSelect />}
                    <Flex alignItems="center" gap={1}>
                        <Text color="secondary">{tokenI18n('title_tokens')}</Text>
                        <Tooltip content={tokenI18n('context_add-token-info')}>
                            <Icon data={CircleQuestionIcon} size={16} />
                        </Tooltip>
                    </Flex>
                </>
            ),
        },
        attributes:
            engine === QueryEngine.SPYT && spytConnect
                ? undefined
                : {
                      items: attributes,
                      onChange: (next) => {
                          setAttributeIds(Object.fromEntries(next.map((row) => [row.key, row.id])));
                          dispatch(updateQueryDraft({settings: applySettingsAttributes(next)}));
                      },
                      attributeCodec: settingsAttributeCodec,
                      checkDuplicateAttributeKeys: true,
                      getAttributePermissions: ({key}) => getQuerySettingPermissions(key),
                      validateAttribute: ({key, value}) => {
                          const errors = formValidator(key, String(value));
                          return {key: errors.name, value: errors.value};
                      },
                  },
    };
}
