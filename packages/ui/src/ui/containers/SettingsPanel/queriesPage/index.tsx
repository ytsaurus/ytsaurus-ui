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
import {GraphAutoCenterSetting} from './GraphAutoCenterSetting';
import SettingsMenuInput from '../../SettingsMenu/SettingsMenuInput';
import {NAMESPACES, SettingName} from '../../../../shared/constants/settings';

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
                SettingName.QUERY_TRACKER.YQL_AGENT_STAGE,
                i18n('field_yql-agent-stage'),
                'top',
                <SettingsMenuInput
                    placeholder={i18n('context_yql-agent-stage-placeholder')}
                    settingName={SettingName.QUERY_TRACKER.YQL_AGENT_STAGE}
                    settingNS={NAMESPACES.QUERY_TRACKER}
                />,
            ),
            makeItem(
                SettingName.QUERY_TRACKER.STAGE,
                i18n('field_query-tracker-stage'),
                'top',
                <SettingsMenuInput
                    placeholder={i18n('context_query-tracker-stage-placeholder')}
                    description={i18n('context_query-tracker-stage-description')}
                    settingName={SettingName.QUERY_TRACKER.STAGE}
                    settingNS={NAMESPACES.QUERY_TRACKER}
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
            makeItem(
                'global::queryTracker::graphAutoCenter',
                i18n('field_graph-auto-center'),
                'top',
                <GraphAutoCenterSetting />,
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
