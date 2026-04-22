import React from 'react';
import {Button, type ButtonProps} from '@gravity-ui/uikit';
import Link from '../../../components/Link/Link';
import Icon from '../../../components/Icon/Icon';
import {createNewQueryUrl, createQueryUrl} from '../utils/navigation';
import {
    selectIsQueryDraftEditted,
    selectQuery,
    selectQueryEngine,
} from '../../../store/selectors/query-tracker/query';
import {useSelector} from '../../../store/redux-hooks';
import i18n from './i18n';

interface Props {
    className?: string;
    cluster: string;
    path: string;
}

export function QueryTrackerOpenButton({className, cluster, path}: Props) {
    const engine = useSelector(selectQueryEngine);
    const isEdited = useSelector(selectIsQueryDraftEditted);
    const queryId = useSelector(selectQuery)?.id;
    let url = '';
    let buttonView: ButtonProps['view'];
    if (queryId && !isEdited) {
        url = createQueryUrl(cluster, queryId);
        buttonView = 'action';
    } else {
        url = createNewQueryUrl(cluster, engine, {
            path,
            useDraft: true,
        });
        buttonView = 'outlined';
    }
    return (
        <Link routed url={url}>
            <Button
                className={className}
                view={buttonView}
                size="l"
                title={i18n('action_open-queries-page')}
            >
                <Icon awesome="external-link" size={16} />
            </Button>
        </Link>
    );
}
