import React from 'react';

import {Alert} from '@gravity-ui/uikit';

import {type YTError} from '../../../../../../../@types/types';
import {YTDFDialog, makeErrorFields} from '../../../../../../containers/Dialog';
import {useDispatch} from '../../../../../../store/redux-hooks';
import {patchOperationSpec} from '../../../../../../store/actions/operations/detail';
import {docsUrl} from '../../../../../../config';
import UIFactory from '../../../../../../UIFactory';
import HelpLink from '../../../../../../components/HelpLink/HelpLink';
import {
    type OperationSpecPatchInput,
    operationSpecPatchToItems,
} from '../../../../../../utils/operations/specification-patch';

import i18n from '../i18n';

type FormValues = {
    patch: {value?: string; error?: string};
};

type Props = {
    operationId: string;
    visible: boolean;
    onClose: () => void;
};

export function EditSpecificationPatchDialog({operationId, visible, onClose}: Props) {
    const dispatch = useDispatch();
    const [error, setError] = React.useState<YTError | Error | undefined>();

    const handleClose = React.useCallback(() => {
        setError(undefined);
        onClose();
    }, [onClose]);

    return (
        visible && (
            <YTDFDialog<FormValues>
                visible
                size="l"
                headerProps={{title: i18n('title_edit-specification')}}
                footerProps={{textApply: i18n('action_apply-patch')}}
                initialValues={{patch: {value: '{\n  \n}'}}}
                onClose={handleClose}
                onAdd={async (form) => {
                    setError(undefined);

                    try {
                        const patch = JSON.parse(
                            form.getState().values.patch.value || '{}',
                        ) as OperationSpecPatchInput;
                        await dispatch(
                            patchOperationSpec(operationId, operationSpecPatchToItems(patch)),
                        );
                        return undefined;
                    } catch (caughtError) {
                        const apiError = caughtError as YTError | Error;
                        setError(apiError);
                        return Promise.reject(apiError);
                    }
                }}
                fields={[
                    {
                        name: 'patch',
                        caption: i18n('field_specification-patch'),
                        type: 'json',
                        fullWidth: true,
                        extras: {initialShowPreview: false, minHeight: 200},
                    },
                    {
                        name: 'patchHelp',
                        type: 'block',
                        extras: {
                            children: (
                                <Alert
                                    theme="info"
                                    message={
                                        <React.Fragment>
                                            {i18n('context_supported-patch-paths')}{' '}
                                            {docsUrl(
                                                <HelpLink
                                                    url={
                                                        UIFactory.docsUrls[
                                                            'api:commands#patch_operation_spec'
                                                        ]
                                                    }
                                                />,
                                            )}
                                        </React.Fragment>
                                    }
                                />
                            ),
                        },
                    },
                    ...makeErrorFields([error]),
                ]}
            />
        )
    );
}
