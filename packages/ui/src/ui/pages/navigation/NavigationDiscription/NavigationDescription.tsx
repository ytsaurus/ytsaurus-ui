import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import ErrorBlock from '../../../components/Error/Error';

import CollapsibleSection from '../../../components/CollapsibleSection/CollapsibleSection';
import {
    getNavigationAnnotation,
    getNavigationAnnotationError,
    getNavigationAnnotationPath,
} from '../../../store/selectors/navigation/tabs/annotation';
import {getPath} from '../../../store/selectors/navigation';

import Link from '../../../components/Link/Link';
import {getSettingAnnotationVisibility} from '../../../store/selectors/settings';
import {setSettingAnnotationVisibility} from '../../../store/actions/settings/settings';
import {
    AnnotationVisibility,
    AnnotationVisibilityType,
} from '../../../../shared/constants/settings-ts';

import './NavigationDescription.scss';
import {Markdown} from '../../../components/Markdown/Markdown';
import {getUISizes} from '../../../store/selectors/global';

const block = cn('navigation-description');

export default function NavigationDescription({className}: {className: string}) {
    const dispatch = useDispatch();
    const annotation = useSelector(getNavigationAnnotation);
    const visibility = useSelector(getSettingAnnotationVisibility);
    const path = useSelector(getPath);
    const annotationPath = useSelector(getNavigationAnnotationPath);
    const error = useSelector(getNavigationAnnotationError);
    const {collapsibleSize} = useSelector(getUISizes);

    const collapsed = visibility === AnnotationVisibility.HIDDEN;
    const handleChange = React.useCallback(
        (/*value: boolean*/) => {
            //console.log(value);
            //const newValue = collapsed ? AnnotationVisibility.PARTIAL : AnnotationVisibility.HIDDEN;
            //dispatch(setSettingAnnotationVisibility(newValue));
        },
        [dispatch, collapsed],
    );

    const showContent = path === annotationPath && (error || annotation);
    return !showContent ? null : (
        <div className={block(null, className)}>
            {
                <CollapsibleSection
                    className={block('collapsible')}
                    name={'Description'}
                    onToggle={handleChange}
                    collapsed={collapsed}
                    size={collapsibleSize}
                >
                    <div className={block('content')}>
                        <AnnotationWithPartial annotation={annotation} visibility={visibility} />
                        {error && <ErrorBlock error={error} />}
                    </div>
                </CollapsibleSection>
            }
        </div>
    );
}

function AnnotationWithPartial({
    annotation,
    visibility,
}: {
    annotation?: string;
    visibility: AnnotationVisibilityType;
}) {
    const dispatch = useDispatch();
    const value = annotation || '';
    const {isFullText, text} = React.useMemo(() => {
        if ('string' !== typeof value) {
            throw new Error(
                `Annotation should be defined as a string but current type is "${typeof value}"`,
            );
        }
        const rows = value.split(/\n+/);
        return {
            text: rows.slice(0, 3).join('\n\n'),
            isFullText: rows.length <= 3,
        };
    }, [value]);

    const expanded = visibility === AnnotationVisibility.VISIBLE;
    const toggleExpand = React.useCallback(() => {
        const newValue = expanded ? AnnotationVisibility.PARTIAL : AnnotationVisibility.VISIBLE;
        dispatch(setSettingAnnotationVisibility(newValue));
    }, [dispatch, expanded]);

    return (
        <div>
            <Markdown text={expanded ? value : text} />
            {isFullText ? null : (
                <Link theme={'ghost'} onClick={toggleExpand}>
                    {expanded ? 'Hide more' : 'Show more'}
                </Link>
            )}
        </div>
    );
}
