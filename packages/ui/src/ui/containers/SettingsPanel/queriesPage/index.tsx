import React from 'react';
import compact_ from 'lodash/compact';
import {BooleanSettingItem} from '../../SettingsMenu/BooleanSettingItem';
import {Flex, Text} from '@gravity-ui/uikit';
import {
    LazyAddQueryTokenForm,
    LazyQueryTokenList,
} from '../../../pages/query-tracker/QueryToken/lazy';
import {makeItem, makePage} from '../settings-description';
import i18n from './i18n';
import {DefaultAcoSelect} from './DefaultAcoSelect';

type Props = {
    cluster: string;
    hasQuerySuggestions: boolean;
};

export const queriesPage = ({cluster, hasQuerySuggestions}: Props) => {
    return makePage(
        i18n('title_queries'),
        undefined,
        compact_([
            cluster &&
                makeItem('defaultACO', i18n('field_default-aco'), undefined, <DefaultAcoSelect />),
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
            makeItem('addQtTokenForm', i18n('title_query-token'), 'top', <LazyAddQueryTokenForm />),
            makeItem('existingQtTokenList', '', 'top', <LazyQueryTokenList />),
        ]),
    );
};
