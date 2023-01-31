import React from 'react';
import YTInfraDialog, {DialogError, FormApi} from '../../../../../components/Dialog/Dialog';
import {getComponentsDecommissionData} from '../../../../../store/selectors/components/nodes/decommission';
import {useDispatch, useSelector} from 'react-redux';
import {YTError} from '../../../../../types';
import {
    closeDecommissionModal,
    decommissionNode,
} from '../../../../../store/actions/components/nodes/actions/decommission';

interface FormValues {
    host: string;
    message: string;
}

function DecommissionNodeModal() {
    const dispatch = useDispatch();
    const {host, message} = useSelector(getComponentsDecommissionData);
    const [error, setError] = React.useState<YTError | undefined>(undefined);

    const handleAdd = React.useCallback(
        async (form: FormApi<FormValues>) => {
            const {values} = form.getState();
            try {
                dispatch(decommissionNode({...values, decommissioned: true}));
            } catch (e) {
                setError(error);
            }
        },
        [setError, dispatch],
    );

    const handleClose = React.useCallback(() => {
        dispatch(closeDecommissionModal());
    }, [dispatch]);

    return (
        <YTInfraDialog<FormValues>
            onAdd={handleAdd}
            onClose={handleClose}
            visible={Boolean(host)}
            fields={[
                {
                    type: 'plain',
                    name: 'host',
                    caption: 'Host',
                },
                {
                    type: 'text',
                    name: 'message',
                    caption: 'Decommission message',
                    required: true,
                    extras: {
                        autoFocus: true,
                    },
                },
                ...(!error
                    ? []
                    : [
                          {
                              type: 'block' as const,
                              name: 'error',
                              extras: {
                                  children: <DialogError error={error} />,
                              },
                          },
                      ]),
            ]}
            initialValues={{message, host}}
            headerProps={{
                title: 'Decommission node',
            }}
        />
    );
}

export default React.memo(DecommissionNodeModal);
