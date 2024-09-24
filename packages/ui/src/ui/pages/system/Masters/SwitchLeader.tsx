import React, {useState} from 'react';
import Icon from '../../../components/Icon/Icon';
import Button from '../../../components/Button/Button';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import {SwitchLeaderShortInfo} from '../../../pages/components/SwitchLeaderShortInfo/SwitchLeaderShortInfo';
import {AppStoreProvider} from '../../../containers/App/AppStoreProvider';

type SwitchLeaderDialogProps = {
    cancel: () => void;
    confirm: (newLeader: string) => Promise<void>;
    visible: boolean;
    cellId: string;
    hosts: string[];
    leadingHost: string;
};

type FormValues = {
    leading_primary_master: string[];
};

const SwitchLeaderDialog = (props: SwitchLeaderDialogProps) => {
    const [error, setError] = useState(undefined);

    const selectLeadingHostOptions = props.hosts.map((host) => {
        return {
            value: host,
            content: host,
        };
    });

    return (
        <YTDFDialog<FormValues>
            visible={props.visible}
            headerProps={{
                title: `Switch leader for ${props.cellId}`,
            }}
            initialValues={{
                leading_primary_master: [props.leadingHost],
            }}
            fields={[
                {
                    type: 'select',
                    caption: ' Leading primary master',
                    name: 'leading_primary_master',
                    required: true,
                    extras: {
                        options: selectLeadingHostOptions,
                        placeholder: 'New leading primary master',
                        width: 'max',
                        filterable: true,
                    },
                },
                ...makeErrorFields([error]),
            ]}
            footerProps={{
                textApply: 'Switch leader',
            }}
            onAdd={(form) => {
                const {leading_primary_master} = form.getState().values;

                return props
                    .confirm(leading_primary_master[0])
                    .then(() => {
                        setError(undefined);
                    })
                    .catch((e) => {
                        setError(e);
                        throw e;
                    });
            }}
            onClose={props.cancel}
            pristineSubmittable={true}
        />
    );
};

type SwitchLeaderButtonProps = {
    className: string;
    cellId: string;
    hosts: string[];
    leadingHost: string;
};

export const SwitchLeaderButton = ({
    cellId,
    hosts,
    leadingHost,
    className,
}: SwitchLeaderButtonProps) => {
    const [visible, setVisible] = useState(false);

    const handleClick = () => {
        setVisible(true);
    };

    const handleConfirm = async (newLeader: string) => {
        const switchLeader = () => {
            return ytApiV4Id.switchLeader(YTApiId.switchLeader, {
                cell_id: cellId,
                new_leader_address: newLeader,
            });
        };

        wrapApiPromiseByToaster(switchLeader(), {
            toasterName: 'switch-leader',
            successContent() {
                return (
                    <AppStoreProvider>
                        <SwitchLeaderShortInfo newLeaderAddress={newLeader} />
                    </AppStoreProvider>
                );
            },
            successTitle: 'Leader switch initiated',
            autoHide: false,
        });

        setVisible(false);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    return (
        <React.Fragment>
            <Button
                className={className}
                view="flat-secondary"
                onClick={handleClick}
                withTooltip
                tooltipProps={{content: 'Switch leader'}}
            >
                <Icon awesome="crowndiamond" />
            </Button>
            <SwitchLeaderDialog
                cellId={cellId}
                hosts={hosts}
                leadingHost={leadingHost}
                confirm={handleConfirm}
                cancel={handleCancel}
                visible={visible}
            />
        </React.Fragment>
    );
};
