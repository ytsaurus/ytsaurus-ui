import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Button} from '@gravity-ui/uikit';

import {YTError} from '../../../../../../@types/types';

import {useUpdater} from '../../../../../hooks/use-updater';

import {useThunkDispatch} from '../../../../../store/thunkDispatch';
import {
    loadFlowDynamicSpec,
    loadFlowStaticSpec,
    updateFlowDynamicSpec,
    updateFlowStaticSpec,
} from '../../../../../store/actions/flow/specs';
import {
    getFlowDynamicSpecData,
    getFlowDynamicSpecFirstLoading,
    getFlowStaticSpecData,
    getFlowStaticSpecError,
    getFlowStaticSpecFirstLoading,
} from '../../../../../store/selectors/flow/specs';
import {getFlowSpecYsonSettings} from '../../../../../store/selectors/thor/unipika';
import {getPath} from '../../../../../store/selectors/navigation';
import {FlowSpecState} from '../../../../../store/reducers/flow/specs';

import Yson from '../../../../../components/Yson/Yson';
import Icon from '../../../../../components/Icon/Icon';
import {YTDFDialog, makeErrorFields} from '../../../../../components/Dialog/Dialog';
import ErrorBlock from '../../../../../components/Block/Block';
import Loader from '../../../../../components/Loader/Loader';
import {UnipikaSettings} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';

import './PipelineSpec.scss';

const block = cn('yt-pipeline-spec');

type PipelineSpecProps = {
    path: string;
    error: YTError | undefined;
    data: FlowSpecState['data'];
    name: string;
    onSave: (data: PipelineSpecProps['data']) => Promise<void>;
};

function PipelineSpec({path, data, error, name, onSave}: PipelineSpecProps) {
    const [showEdit, setShowEdit] = React.useState(false);

    const settings = useSelector(getFlowSpecYsonSettings);

    return (
        <React.Fragment>
            {Boolean(error) && <ErrorBlock error={error} />}
            <Yson
                value={data}
                settings={settings}
                virtualized
                folding
                extraTools={
                    <React.Fragment>
                        <Button view="outlined" onClick={() => setShowEdit(true)}>
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
                onSave={onSave}
                onClose={() => setShowEdit(false)}
                data={data}
                settings={settings}
            />
        </React.Fragment>
    );
}

type FormValues = {
    text: {value?: string};
    path: string;
};

function EditSpecDialog({
    path,
    visible,
    data,
    onClose,
    onSave,
    name,
    settings,
}: Pick<PipelineSpecProps, 'name' | 'path' | 'data' | 'onSave'> & {
    visible: boolean;
    onClose: () => void;
    settings: UnipikaSettings;
}) {
    const [error, setError] = React.useState<YTError | undefined>();

    const text = React.useMemo(() => {
        return {value: JSON.stringify(data, null, 4)};
    }, [data]);

    return (
        visible && (
            <YTDFDialog<FormValues>
                visible
                size="l"
                onClose={onClose}
                initialValues={{text, path}}
                headerProps={{
                    title: `Edit ${name}`,
                }}
                onAdd={async (f) => {
                    setError(undefined);
                    const {text} = f.getState().values;
                    if (text.value) {
                        try {
                            return onSave(JSON.parse(text.value));
                        } catch (e: any) {
                            setError(e);
                        }
                    } else {
                        return Promise.resolve();
                    }
                }}
                fields={[
                    {
                        caption: 'Pipeline path',
                        name: 'path',
                        type: 'plain',
                    },
                    {
                        name: 'text',
                        caption: 'Specification',
                        type: 'json',
                        fullWidth: true,
                        extras: {
                            className: block('editor'),
                            initialShowPreview: false,
                            unipikaSettings: settings,
                        },
                    },
                    ...makeErrorFields([error]),
                ]}
            />
        )
    );
}

export function FlowStaticSpec() {
    const dispatch = useThunkDispatch();

    const path = useSelector(getPath);
    const data = useSelector(getFlowStaticSpecData);
    const error = useSelector(getFlowStaticSpecError);
    const firstLoading = useSelector(getFlowStaticSpecFirstLoading);

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowStaticSpec(path));
    }, [dispatch, path]);
    useUpdater(updateFn);

    const onEdit = React.useCallback(
        (newData: typeof data) => {
            return dispatch(updateFlowStaticSpec({path, data: newData}));
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
        />
    );
}

export function FlowDynamicSpec() {
    const dispatch = useThunkDispatch();

    const path = useSelector(getPath);
    const data = useSelector(getFlowDynamicSpecData);
    const error = useSelector(getFlowStaticSpecError);
    const firstLoading = useSelector(getFlowDynamicSpecFirstLoading);

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

    return firstLoading ? (
        <Loader />
    ) : (
        <PipelineSpec
            path={path}
            data={data}
            error={error}
            name="dynamic specification"
            onSave={onEdit}
        />
    );
}
