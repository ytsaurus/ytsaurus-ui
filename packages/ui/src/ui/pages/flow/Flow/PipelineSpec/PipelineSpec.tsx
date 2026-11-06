import React from 'react';

import {Button} from '@gravity-ui/uikit';

import {type YTError} from '../../../../../@types/types';

import {useUpdater} from '../../../../hooks/use-updater';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    loadFlowDynamicSpec,
    loadFlowStaticSpec,
    mutateFlowDynamicSpec,
    updateFlowDynamicSpec,
    updateFlowStaticSpec,
} from '../../../../store/actions/flow/specs';
import {
    selectFlowDynamicSpecData,
    selectFlowDynamicSpecError,
    selectFlowDynamicSpecFirstLoading,
    selectFlowStaticSpecData,
    selectFlowStaticSpecError,
    selectFlowStaticSpecFirstLoading,
} from '../../../../store/selectors/flow/specs';
import {selectFlowSpecYsonSettings} from '../../../../store/selectors/thor/unipika';
import {type FlowSpecState} from '../../../../store/reducers/flow/specs';

import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {YsonWithScroll} from '../../../../components/Yson/YsonWithScroll';
import Icon from '../../../../components/Icon/Icon';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import Loader from '../../../../components/Loader/Loader';

import {pathToFileName} from '../../../navigation/helpers/pathToFileName';

import {EditSpecDialog} from './EditSpecDialog/EditSpecDialog';
import {DynamicSpec} from './DynamicSpec/DynamicSpec';
import {dynamicSpecPath} from '../../../../utils/flow/dynamic-spec';

import './PipelineSpec.scss';

type PipelineSpecProps = {
    path: string;
    error: YTError | undefined;
    data: FlowSpecState['data'];
    name: string;
    onSave: (data: PipelineSpecProps['data'], options: {force?: boolean}) => Promise<void>;
    allowForce?: boolean;
};

function PipelineSpec({path, data, error, name, onSave, allowForce}: PipelineSpecProps) {
    const [showEdit, setShowEdit] = React.useState(false);

    const settings = useSelector(selectFlowSpecYsonSettings);

    return (
        <React.Fragment>
            {Boolean(error) && <YTErrorBlock error={error} />}
            <YsonWithScroll
                value={data}
                settings={settings}
                extraTools={
                    <React.Fragment>
                        <YsonDownloadButton
                            value={data}
                            settings={settings}
                            name={`pipeline_spec_${pathToFileName(path)}`}
                        />
                        <Button
                            view="outlined"
                            disabled={!data}
                            onClick={() => {
                                setShowEdit(true);
                            }}
                        >
                            <Icon awesome="pencil" />
                            Edit {name}
                        </Button>
                    </React.Fragment>
                }
            />
            <EditSpecDialog
                path={path}
                name={name}
                visible={showEdit}
                onSpecApply={(spec, options) => onSave({...data!, spec}, options)}
                onClose={() => setShowEdit(false)}
                spec={data?.spec}
                settings={settings}
                allowForce={allowForce}
            />
        </React.Fragment>
    );
}

export function FlowStaticSpec({pipeline_path: path}: {pipeline_path: string}) {
    const dispatch = useDispatch();

    const data = useSelector(selectFlowStaticSpecData);
    const error = useSelector(selectFlowStaticSpecError);
    const firstLoading = useSelector(selectFlowStaticSpecFirstLoading);

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowStaticSpec(path));
    }, [dispatch, path]);
    useUpdater(updateFn);

    const onEdit = React.useCallback(
        (newData: typeof data, options: {force?: boolean}) => {
            return dispatch(updateFlowStaticSpec({path, data: newData}, options));
        },
        [path, dispatch],
    );

    return firstLoading ? (
        <Loader />
    ) : (
        <PipelineSpec
            path={path}
            data={data}
            error={error}
            name="static specification"
            onSave={onEdit}
            allowForce
        />
    );
}

export function FlowDynamicSpec({pipeline_path: path}: {pipeline_path: string}) {
    const dispatch = useDispatch();

    const data = useSelector(selectFlowDynamicSpecData);
    const settings = useSelector(selectFlowSpecYsonSettings);
    const error = useSelector(selectFlowDynamicSpecError);
    const firstLoading = useSelector(selectFlowDynamicSpecFirstLoading);

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowDynamicSpec(path));
    }, [dispatch, path]);
    useUpdater(updateFn);

    const onEdit = React.useCallback(
        (newData: typeof data) => {
            return dispatch(updateFlowDynamicSpec({path, data: newData}));
        },
        [path, dispatch],
    );

    if (firstLoading) {
        return <Loader />;
    }
    return (
        <>
            {Boolean(error) && <YTErrorBlock error={error} />}
            <DynamicSpec
                key={path}
                snapshot={data?.dynamic_spec_state}
                unavailable={data?.dynamic_spec_state_unavailable}
                settings={settings}
                pipelinePath={path}
                onCancel={(patch, expected_version) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'cancel-pipeline-dynamic-spec-patch',
                            body: {patch, expected_version},
                        }),
                    )
                }
                onUpdate={(patch, changes, comment, expected_version) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'patch-pipeline-dynamic-spec',
                            body: {
                                patch,
                                comment,
                                expected_version,
                                ...(changes === undefined
                                    ? {}
                                    : {
                                          set_changes: changes.map(({path: changePath, value}) => ({
                                              path: dynamicSpecPath(changePath),
                                              value,
                                          })),
                                      }),
                            },
                        }),
                    )
                }
                onReset={(expected_version) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'reset-pipeline-dynamic-spec',
                            body: {expected_version},
                        }),
                    )
                }
                renderEffective={() => (
                    <PipelineSpec
                        path={path}
                        data={data && {spec: data.spec, version: data.version}}
                        error={undefined}
                        name="dynamic specification"
                        onSave={onEdit}
                    />
                )}
            />
        </>
    );
}
