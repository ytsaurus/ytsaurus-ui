import {getQuerySettingPermissions} from '../../../../utils/query-tracker/settings';
import {selectQuerySessionRevision} from '../../../../store/selectors/query-tracker/querySession';
import type {BuiltinEngineSettings} from '@gravity-ui/querieskit/widgets/QueryEditor/presets/builtin';
import React, {useEffect, useState} from 'react';
import type {QuerySettingsProps} from '@gravity-ui/querieskit';
import {Flex, Icon, Text, Tooltip} from '@gravity-ui/uikit';
import CircleQuestionIcon from '@gravity-ui/icons/svgs/circle-question.svg';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectCurrentQuery,
    selectCurrentSecretIds,
    selectQueryDraft,
} from '../../../../store/selectors/query-tracker/query';
import {selectIsSupportedQtACO} from '../../../../store/selectors/query-tracker/queryAco';
import {selectAvailableSpytConnect} from '../../../../store/selectors/query-tracker/queryTrackerEnginesInfo';
import {selectQueryTokens} from '../../../../store/selectors/settings/settings-queries';
import {updateQueryDraft} from '../../../../store/actions/query-tracker/query';
import {setQueryName} from '../../../../store/actions/query-tracker/queryAnnotations';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {QueryACOSelect} from '../../QueryACO/QueryACOSelect';
import {formValidator} from '../../QuerySettingsButton/formValidator';
import {toaster} from '../../../../utils/toaster';
import tokenI18n from '../../QueryToken/QueryTokenButton/i18n';
import {applySettingsAttributes, getSettingsAttributes, settingsAttributeCodec} from './attributes';

export function useQuerySettingsProps(engineSettings: {
    custom: BuiltinEngineSettings;
    onChange: QuerySettingsProps<BuiltinEngineSettings, unknown>['onChange'];
}): QuerySettingsProps<BuiltinEngineSettings, unknown> {
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
    const value = {
        queryName: annotations?.title || '',
        access: 'private' as const,
        ytOperationTitle: '',
        tokenIds,
        attributes,
        custom: engineSettings.custom,
    };

    return {
        value,
        attributeCodec: settingsAttributeCodec,
        tokens: tokens.map(({name}) => ({id: name, title: name})),
        hiddenFields:
            engine === QueryEngine.SPYT && spytConnect
                ? ['access', 'ytOperationTitle', 'attributes']
                : ['access', 'ytOperationTitle'],
        onChange: (next, change) => {
            const fieldChanged = (field: 'queryName' | 'tokenIds') =>
                change
                    ? change.changes.some(
                          (item) => item.section === 'fields' && item.field === field,
                      )
                    : next[field] !== value[field];
            if (fieldChanged('queryName')) {
                dispatch(updateQueryDraft({annotations: {...annotations, title: next.queryName}}));
            }
            if (fieldChanged('tokenIds')) {
                dispatch(
                    updateQueryDraft({
                        secrets: tokens
                            .filter(({name}) => next.tokenIds.includes(name))
                            .map(({name, cluster, path}) => ({
                                id: name,
                                ypath: `${cluster}:${path}`,
                            })),
                    }),
                );
            }
            if (
                change
                    ? change.changes.some((item) => item.section === 'attributes')
                    : next.attributes !== attributes
            ) {
                setAttributeIds(
                    Object.fromEntries(next.attributes.map((row) => [row.key, row.id])),
                );
                dispatch(
                    updateQueryDraft({
                        settings: applySettingsAttributes(next.attributes),
                    }),
                );
            }
            engineSettings.onChange(next, change);
        },
        onFieldBlur: (field) => {
            if (
                field.section === 'fields' &&
                field.field === 'queryName' &&
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
        checkDuplicateAttributeKeys: true,
        getAttributePermissions: ({key}) => getQuerySettingPermissions(key),
        validateAttribute: ({key, value: attributeValue}) => {
            const errors = formValidator(key, String(attributeValue));
            return {key: errors.name, value: errors.value};
        },
        renderCustomFields: () => (
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
    };
}
