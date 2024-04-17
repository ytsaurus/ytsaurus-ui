import React, {useState} from 'react';
import {Toaster} from '@gravity-ui/uikit';
import Icon from '../../../components/Icon/Icon';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import block from 'bem-cn-lite';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {showErrorPopup} from '../../../utils/utils';
import {useDispatch} from 'react-redux';
import {waitForSwitchLeader} from '../../../store/actions/system/masters';
import {isYTError} from '../../../../shared/utils';
import './SwitchLeader.scss';

const b = block('switch-leader-button');

const toaster = new Toaster();

const TOAST_SWITCH_LEADER_INITIATED = 'Leader switch initiated successfully';
const TOAST_SWITCH_LEADER_COMPLETED = `Switch leader completed`;

type SwitchLeaderPromtProps = {
    cancel: () => void;
    confirm: () => void;
    visible: boolean;
    loading: boolean;
    currentLeaderAddress: string;
    newLeaderAddress: string;
};

const SwitchLeaderPromt = (props: SwitchLeaderPromtProps) => {
    return (
        <Modal
            title="Are you sure that you want to switch the cell leader?"
            content={
                <>
                    <div className={b('address')}>
                        <span>Old leader:</span>
                        <span>
                            {props.currentLeaderAddress}
                            <ClipboardButton
                                view="flat-secondary"
                                text={props.currentLeaderAddress}
                            />
                        </span>
                    </div>
                    <div className={b('address')}>
                        <span>New leader:</span>
                        <span>
                            {props.newLeaderAddress}
                            <ClipboardButton view="flat-secondary" text={props.newLeaderAddress} />
                        </span>
                    </div>
                </>
            }
            confirmText="Switch"
            onCancel={props.cancel}
            onConfirm={props.confirm}
            onOutsideClick={props.cancel}
            visible={props.visible}
            loading={props.loading}
        />
    );
};

type SwitchLeaderButtonProps = {
    className: string;
    currentLeaderAddress: string;
    newLeaderAddress: string;
    cellId: string;
};

export const SwitchLeaderButton = ({
    currentLeaderAddress,
    newLeaderAddress,
    cellId,
    className,
}: SwitchLeaderButtonProps) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleClick = () => {
        setVisible(true);
    };

    const handleConfirm = async () => {
        setLoading(true);

        try {
            await ytApiV4Id.switchLeader(YTApiId.switchLeader, {
                cell_id: cellId,
                new_leader_address: newLeaderAddress,
            });

            toaster.add({
                name: TOAST_SWITCH_LEADER_INITIATED,
                autoHiding: 10000,
                type: 'success',
                title: TOAST_SWITCH_LEADER_INITIATED,
            });

            await dispatch(waitForSwitchLeader({newLeaderAddress}));

            toaster.add({
                name: TOAST_SWITCH_LEADER_COMPLETED,
                autoHiding: 10000,
                type: 'success',
                title: TOAST_SWITCH_LEADER_COMPLETED,
            });

            setLoading(false);
            setVisible(false);
        } catch (error: any) {
            setLoading(false);

            if (isYTError(error)) {
                toaster.add({
                    name: error.message,
                    autoHiding: 10000,
                    type: 'error',
                    title: error.message,
                    actions: [{label: ' view', onClick: () => showErrorPopup(error)}],
                });
            } else {
                console.error(error);
            }
        }
    };

    const handleCancel = () => {
        if (loading) {
            return;
        }

        setVisible(false);
        setLoading(false);
    };

    return (
        <React.Fragment>
            <Button
                className={className}
                view="flat-secondary"
                onClick={handleClick}
                withTooltip
                tooltipProps={{content: 'Switch to leader'}}
            >
                <Icon awesome="timestamps" />
            </Button>
            <SwitchLeaderPromt
                newLeaderAddress={newLeaderAddress}
                currentLeaderAddress={currentLeaderAddress}
                confirm={handleConfirm}
                cancel={handleCancel}
                visible={visible}
                loading={loading}
            />
        </React.Fragment>
    );
};
