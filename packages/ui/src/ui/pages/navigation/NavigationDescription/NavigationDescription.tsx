import React, {FC, useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import ypath from '../../../common/thor/ypath';
import CollapsibleSection from '../../../components/CollapsibleSection/CollapsibleSection';
import {getNavigationAnnotationEditing} from '../../../store/selectors/navigation/tabs/annotation';
import {getAttributes, getPath} from '../../../store/selectors/navigation';
import {getSettingAnnotationVisibility, getUseAutoRefresh} from '../../../store/selectors/settings';
import {setSettingAnnotationVisibility} from '../../../store/actions/settings/settings';
import {AnnotationVisibility} from '../../../../shared/constants/settings-ts';
import './NavigationDescription.scss';
import {AnnotationWithPartial} from './AnnotationWithPartial';
import {EditAnnotationWithPreview} from '../../../components/EditAnnotationWithPreview/EditAnnotationWithPreview';
import {useGetExternalDescriptionQuery} from '../../../store/api/pages/navigation/tabs/description';
import {SET_ANNOTATION} from '../../../constants/navigation/tabs/annotation';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';
import {NavigationDescriptionOverview} from './NavigationDescriptionOverview';
import {getCluster} from '../../../store/selectors/global';
import {DEFAULT_UPDATER_TIMEOUT} from '../../../hooks/use-updater';

const block = cn('navigation-description');

type Props = {
    className: string;
};

const NavigationDescription: FC<Props> = ({className}) => {
    const dispatch = useDispatch();
    const attributes = useSelector(getAttributes);
    const path = useSelector(getPath);
    const cluster = useSelector(getCluster);

    const visibility = useSelector(getSettingAnnotationVisibility);
    const isEditing = useSelector(getNavigationAnnotationEditing);

    const annotation = ypath.getValue(attributes, '/annotation') || '';
    const annotationPath = ypath.getValue(attributes, '/annotation_path');

    const useAutoRefresh = useSelector(getUseAutoRefresh) as boolean;
    const {data} = useGetExternalDescriptionQuery(
        {cluster, path},
        {
            pollingInterval: useAutoRefresh ? DEFAULT_UPDATER_TIMEOUT : undefined,
            skipPollingIfUnfocused: true,
        },
    );

    const [showExternalDescription, setShowExternalDescription] = useState(false);

    const expanded = visibility === AnnotationVisibility.VISIBLE;
    const handleToggleAnnotationCollapse = useCallback(() => {
        dispatch(
            setSettingAnnotationVisibility(
                expanded ? AnnotationVisibility.PARTIAL : AnnotationVisibility.VISIBLE,
            ),
        );
    }, [dispatch, expanded]);

    const handleChangeDescription = useCallback(
        ({value}: {value: string | undefined}) => {
            dispatch({type: SET_ANNOTATION, data: value || ''});
        },
        [dispatch],
    );

    if (!(path === annotationPath && annotation)) return null;

    return (
        <div className={block(null, className)}>
            <CollapsibleSection
                className={block('collapsible')}
                name={'Description'}
                collapsed={false}
                size={UI_COLLAPSIBLE_SIZE}
                overview={
                    <NavigationDescriptionOverview
                        annotationLink={data?.annotationLink || ''}
                        annotation={data?.annotation || ''}
                        showExternalDescription={showExternalDescription}
                        setShowExternalDescription={setShowExternalDescription}
                    />
                }
            >
                <div className={block('content')}>
                    {isEditing ? (
                        <EditAnnotationWithPreview
                            valuePath={path}
                            value={{value: annotation}}
                            initialValue={{value: annotation}}
                            onChange={handleChangeDescription}
                            className={block('edit-block')}
                            hideReset
                        />
                    ) : (
                        <AnnotationWithPartial
                            annotation={showExternalDescription ? data?.annotation : annotation}
                            expanded={expanded}
                            onToggle={handleToggleAnnotationCollapse}
                        />
                    )}
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default NavigationDescription;
