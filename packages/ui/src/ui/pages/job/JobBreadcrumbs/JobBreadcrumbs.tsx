import React, {useState, useCallback} from 'react';
import {useHistory, useRouteMatch} from 'react-router';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {TextInput} from '@gravity-ui/uikit';
import Button from '../../../components/Button/Button';
import Icon from '../../../components/Icon/Icon';

import {getCluster} from '../../../store/selectors/global';
import {KeyCode, Page} from '../../../constants/index';
import {RouteInfo} from '../../../pages/job/Job';

import './JobBreadcrumbs.scss';

const block = cn('job-breadcrumbs');

interface JobBreadcrumbsProps {
    id?: string;
    className?: string;
}

export default function JobBreadcrumbs({id, className}: JobBreadcrumbsProps) {
    const match = useRouteMatch<RouteInfo>();
    const cluster = useSelector(getCluster);
    const history = useHistory();

    const [editMode, changeEditMode] = useState(false);
    const [jobID, changeJobID] = useState(match.params.jobID);

    const {operationID} = match.params;
    const path = `${operationID}/${jobID}`;

    const handleEditClick = useCallback(() => changeEditMode(true), []);
    const handleInputChange = useCallback((val: string) => changeJobID(val), []);
    const handleInputBlur = useCallback(() => changeEditMode(false), []);
    const handleInputKeyDown = useCallback(
        (evt: React.KeyboardEvent) => {
            if (evt.keyCode === KeyCode.ENTER) {
                changeEditMode(false);
                history.push(`/${cluster}/${Page.JOB}/${path}`);
            }
        },
        [path, history, cluster],
    );

    const other = {
        onBlur: handleInputBlur,
    };

    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                {editMode ? (
                    <div className={block('input')}>
                        <TextInput
                            {...other}
                            autoFocus
                            size="m"
                            value={jobID}
                            onUpdate={handleInputChange}
                            onKeyDown={handleInputKeyDown}
                        />
                    </div>
                ) : (
                    <div className={block('id')}>
                        <span className="elements-ellipsis">{id}</span>
                        &nbsp;
                        <ClipboardButton view="flat-secondary" text={id} size="m" />
                        &nbsp;
                        <Button view="flat-secondary" size="m" onClick={handleEditClick}>
                            <Icon awesome="pencil" />
                        </Button>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}
