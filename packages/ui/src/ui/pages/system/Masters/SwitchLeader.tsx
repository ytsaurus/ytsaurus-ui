import React, {useState} from 'react';
import Icon from '../../../components/Icon/Icon';
import Button from '../../../components/Button/Button';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {YTDFDialog, makeErrorFields} from '../../../containers/Dialog';
import {SwitchLeaderShortInfo} from '../../../pages/components/SwitchLeaderShortInfo/SwitchLeaderShortInfo';
import {AppStoreProvider} from '../../../containers/App/AppStoreProvider';
import i18n from './i18n/index-switch-leader';

type SwitchLeaderDialogProps = {
    cancel: () => void;
    confirm: (newLeader: string) => Promise<void>;
    visible: boolean;
    cellId: string;
    hosts: Array<{getPath: () => string; state: 'leading'}>;
};

type FormValues = {
    leading_primary_master: string[];
};

const SwitchLeaderDialog = (props: SwitchLeaderDialogProps) => {
    const [error, setError] = useState(undefined);

    const selectLeadingHostOptions = props.hosts.map((host) => {
        const path = host.getPath();
        return {
            value: path,
            content: path.split('/').pop(),
        };
    });

    const leader = props.hosts.find(({state}) => state === 'leading');
    const leaderPath = leader?.getPath();

    return (
        <YTDFDialog<FormValues>
            visible={props.visible}
            headerProps={{
                title: i18n('title_switch-leader-for', {cellId: props.cellId}),
            }}
            initialValues={{
                leading_primary_master: leaderPath ? [leaderPath] : [],
            }}
            fields={[
                {
                    type: 'select',
                    caption: i18n('field_leading-primary-master'),
                    name: 'leading_primary_master',
                    required: true,
                    extras: {
                        options: selectLeadingHostOptions,
                        placeholder: i18n('context_new-leading-primary-master'),
                        width: 'max',
                        filterable: true,
                    },
                },
                ...makeErrorFields([error]),
            ]}
            footerProps={{
                textApply: i18n('action_switch-leader'),
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
    hosts: Array<{getPath: () => string; state: 'leading'}>;
};

export const SwitchLeaderButton = ({cellId, hosts, className}: SwitchLeaderButtonProps) => {
    const [visible, setVisible] = useState(false);

    const handleClick = () => {
        setVisible(true);
    };

    const handleConfirm = async (newLeaderPath: string) => {
        const leaderAddress = newLeaderPath.split('/').pop();
        const switchLeader = () => {
            return ytApiV4Id.switchLeader(YTApiId.switchLeader, {
                cell_id: cellId,
                new_leader_address: leaderAddress!,
            });
        };

        wrapApiPromiseByToaster(switchLeader(), {
            toasterName: 'switch-leader',
            successContent() {
                return (
                    <AppStoreProvider>
                        <SwitchLeaderShortInfo newLeaderPath={newLeaderPath} />
                    </AppStoreProvider>
                );
            },
            successTitle: i18n('alert_leader-switch-initiated'),
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
                tooltipProps={{content: i18n('action_switch-leader')}}
            >
                <Icon awesome="crowndiamond" />
            </Button>
            {visible && (
                <SwitchLeaderDialog
                    visible
                    cellId={cellId}
                    hosts={hosts}
                    confirm={handleConfirm}
                    cancel={handleCancel}
                />
            )}
        </React.Fragment>
    );
};
