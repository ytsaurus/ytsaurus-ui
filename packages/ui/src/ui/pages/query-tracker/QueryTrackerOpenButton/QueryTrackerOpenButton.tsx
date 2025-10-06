import React from 'react';
import {Button, ButtonProps} from '@gravity-ui/uikit';
import Link from '../../../components/Link/Link';
import Icon from '../../../components/Icon/Icon';
import {createNewQueryUrl, createQueryUrl} from '../utils/navigation';
import {
    getQuery,
    getQueryEngine,
    isQueryDraftEditted,
} from '../../../store/selectors/query-tracker/query';
import {useSelector} from 'react-redux';

interface Props {
    className?: string;
    cluster: string;
    path: string;
}

export function QueryTrackerOpenButton({className, cluster, path}: Props) {
    const engine = useSelector(getQueryEngine);
    const isEdited = useSelector(isQueryDraftEditted);
    const queryId = useSelector(getQuery)?.id;
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
            <Button className={className} view={buttonView} size="l" title="Open Queries page">
                <Icon awesome="external-link" size={16} />
            </Button>
        </Link>
    );
}
