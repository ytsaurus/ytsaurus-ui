import React from 'react';
import {Flex, TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectCurrentQuery,
    selectQueryDraft,
} from '../../../../store/selectors/query-tracker/query';
import {selectIsSupportedQtACO} from '../../../../store/selectors/query-tracker/queryAco';
import {selectAvailableSpytConnect} from '../../../../store/selectors/query-tracker/queryTrackerEnginesInfo';
import {updateQueryDraft} from '../../../../store/actions/query-tracker/query';
import {setQueryName} from '../../../../store/actions/query-tracker/queryAnnotations';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {QuerySettings} from '../../QuerySettingsButton/QuerySettings';
import {SpytSettings} from '../../QuerySettingsButton/SpytSettings/SpytSettings';
import {QuerySelectorsByEngine} from '../../QueryTrackerTopRow/QuerySelectorsByEngine';
import {QueryACOSelect} from '../../QueryACO/QueryACOSelect';
import {QueryTokenDropdown} from '../../QueryToken/QueryTokenButton/QueryTokenDropdown';
import {toaster} from '../../../../utils/toaster';
import i18n from '../../QueryTrackerTopRow/i18n';

export function QuerySettingsPanel() {
    const dispatch = useDispatch();
    const {id, annotations, engine, settings} = useSelector(selectQueryDraft);
    const currentQuery = useSelector(selectCurrentQuery);
    const acoSupported = useSelector(selectIsSupportedQtACO);
    const spytConnect = useSelector(selectAvailableSpytConnect);
    const changeSettings = (next: typeof settings) => dispatch(updateQueryDraft({settings: next}));
    return (
        <Flex direction="column" gap={3}>
            <TextInput
                value={annotations?.title || ''}
                placeholder={i18n('field_no-name')}
                controlProps={{'aria-label': i18n('field_no-name')}}
                onUpdate={(title) =>
                    dispatch(updateQueryDraft({annotations: {...annotations, title}}))
                }
                onBlur={() => {
                    if (
                        id &&
                        currentQuery?.id === id &&
                        currentQuery.annotations?.title !== annotations?.title
                    )
                        dispatch(setQueryName(id, annotations?.title)).catch((error) => {
                            toaster.add({
                                name: 'query-name',
                                theme: 'danger',
                                title: String(error.message || error),
                            });
                        });
                }}
            />
            <QuerySelectorsByEngine />
            {acoSupported && <QueryACOSelect />}
            {engine === QueryEngine.SPYT && spytConnect ? (
                <SpytSettings settings={settings} onChange={changeSettings} />
            ) : (
                <QuerySettings settings={settings} onChange={changeSettings} />
            )}
            <QueryTokenDropdown />
        </Flex>
    );
}
