import React from 'react';
import compact_ from 'lodash/compact';
import {SettingsMenuSelect} from '../../SettingsMenu/SettingsMenuSelect';
import {
    getQueryACO,
    setUserDefaultACO,
} from '../../../pages/query-tracker/module/query_aco/actions';
import {Item} from '../../../components/Select/Select';
import {BooleanSettingItem} from '../../SettingsMenu/BooleanSettingItem';
import {Flex, Text} from '@gravity-ui/uikit';
import {
    LazyAddQueryTokenForm,
    LazyQueryTokenList,
} from '../../../pages/query-tracker/QueryToken/lazy';
import {makeItem, makePage} from '../settings-description';
import {AppThunkDispatch} from '../../../store/thunkDispatch';
import {AnyAction} from 'redux';
import i18n from './i18n';

type Props = {
    dispatch: AppThunkDispatch<AnyAction>;
    cluster: string;
    defaultUserACO: string;
    hasQuerySuggestions: boolean;
};

export const queriesPage = ({cluster, hasQuerySuggestions, dispatch, defaultUserACO}: Props) => {
    return makePage(
        i18n('title_queries'),
        undefined,
        compact_([
            cluster &&
                makeItem(
                    'defaultACO',
                    i18n('field_default-aco'),
                    undefined,
                    <SettingsMenuSelect
                        getOptionsOnMount={() =>
                            dispatch(getQueryACO()).then((data) => {
                                return data.access_control_objects.reduce(
                                    (acc: Item[], item: string) => {
                                        acc.push({value: item, text: item});
                                        return acc;
                                    },
                                    [] as Item[],
                                );
                            })
                        }
                        setSetting={(value) => value && dispatch(setUserDefaultACO(value))}
                        getSetting={() => defaultUserACO}
                    />,
                ),
            makeItem(
                'global::queryTracker::useNewGraphView',
                i18n('field_new-graph-progress'),
                'top',
                <BooleanSettingItem
                    settingKey="global::queryTracker::useNewGraphView"
                    description={i18n('context_new-graph-progress-description')}
                    oneLine
                />,
            ),
            ...(hasQuerySuggestions
                ? [
                      makeItem(
                          'global::queryTracker::suggestions',
                          i18n('field_query-assistant'),
                          'top',
                          <BooleanSettingItem
                              settingKey="global::queryTracker::suggestions"
                              description={
                                  <Flex direction="column">
                                      <div>{i18n('context_query-assistant-description')}</div>
                                      <Text color="secondary">
                                          {i18n('context_tab-accept-suggestion')}
                                      </Text>
                                      <Text color="secondary">
                                          {i18n('context_esc-decline-suggestion')}
                                      </Text>
                                  </Flex>
                              }
                              oneLine
                          />,
                      ),
                  ]
                : []),
            makeItem(
                'addQtTokenForm',
                i18n('title_add-query-token'),
                'top',
                <LazyAddQueryTokenForm />,
            ),
            makeItem(
                'existingQtTokenList',
                i18n('title_existing-query-tokens'),
                'top',
                <LazyQueryTokenList />,
            ),
        ]),
    );
};
