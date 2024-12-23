import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import Yson from '../../../../components/Yson/Yson';
import {Checkbox, Flex, Loader} from '@gravity-ui/uikit';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';

import {RootState} from '../../../../store/reducers';
import {
    abortAndReset,
    changeOmitInputTableSpecs,
    changeOmitNodeDirectory,
    changeOmitOutputTableSpecs,
    loadJobSpecification,
} from '../../../../store/actions/job/specification';

import './Specification.scss';
import {getJobSpecificationYsonSettings} from '../../../../store/selectors/thor/unipika';
import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {getJob} from '../../../../store/selectors/job/detail';

interface SpecificationProps {
    className?: string;
    jobID: string;
}

const block = cn('job-specification');

function Toolbar({jobID}: SpecificationProps) {
    const dispatch = useDispatch();

    const {omitNodeDirectory, omitInputTableSpecs, omitOutputTableSpecs} = useSelector(
        (state: RootState) => state.job.specification,
    );

    const handleNodeDirectoryChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(changeOmitNodeDirectory(jobID));
            blurByEvent(e);
        },
        [dispatch, jobID],
    );

    const handleInputTableSpecsChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(changeOmitInputTableSpecs(jobID));
            blurByEvent(e);
        },
        [dispatch, jobID],
    );

    const handleOutputTableSpecsChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(changeOmitOutputTableSpecs(jobID));
            blurByEvent(e);
        },
        [dispatch, jobID],
    );

    return (
        <div className={block('toolbar')}>
            <Checkbox
                className={block('checkbox')}
                size="l"
                content="Omit node directory"
                checked={omitNodeDirectory}
                onChange={handleNodeDirectoryChange}
            />

            <Checkbox
                className={block('checkbox')}
                size="l"
                content="Omit input table specs"
                checked={omitInputTableSpecs}
                onChange={handleInputTableSpecsChange}
            />

            <Checkbox
                className={block('checkbox')}
                size="l"
                content="Omit output table specs"
                checked={omitOutputTableSpecs}
                onChange={handleOutputTableSpecsChange}
            />
        </div>
    );
}

function blurByEvent(e: React.ChangeEvent<HTMLInputElement>) {
    (e.target as HTMLInputElement).blur();
}

export default function Specification({className, jobID}: SpecificationProps) {
    const dispatch = useDispatch();

    const {loading, loaded, error, errorData, specification} = useSelector(
        (state: RootState) => state.job.specification,
    );
    const {id} = useSelector(getJob);

    useEffect(() => {
        dispatch(loadJobSpecification(jobID));

        return () => {
            dispatch(abortAndReset());
        };
    }, [dispatch, jobID]);

    const initialLoading = loading && !loaded;
    const settings = useSelector(getJobSpecificationYsonSettings);

    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <div className={block('content', {loading: initialLoading})}>
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                            <Yson
                                folding={true}
                                settings={settings}
                                value={specification}
                                extraTools={
                                    <Flex alignItems="center" gap={2}>
                                        <YsonDownloadButton
                                            value={specification}
                                            settings={settings}
                                            name={`specification_job_${id}`}
                                        />
                                        <Toolbar jobID={jobID} />
                                    </Flex>
                                }
                            />
                        </LoadDataHandler>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}
