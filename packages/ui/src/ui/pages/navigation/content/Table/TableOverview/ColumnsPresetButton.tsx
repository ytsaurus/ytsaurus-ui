import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import Button, {ButtonProps} from '../../../../../components/Button/Button';
import {
    openTableWithPresetOfColumns,
    rememberPresetColumnsAsDefault,
} from '../../../../../store/actions/navigation/content/table/table';
import Icon from '../../../../../components/Icon/Icon';
import {getColumnsPresetHash} from '../../../../../store/selectors/navigation/content/table-ts';

type Props = Required<Pick<ButtonProps, 'view' | 'disabled'>>;

function SharePresetButton(props: Props) {
    const dispatch = useDispatch();

    const handleClick = React.useCallback(() => {
        dispatch(openTableWithPresetOfColumns());
    }, [dispatch]);

    return (
        <Tooltip content={'Share current set of columns for the table'}>
            <Button {...props} pin={'clear-round'} onClick={handleClick}>
                <Icon awesome={'share'} />
            </Button>
        </Tooltip>
    );
}

function SavePresetButton(props: Props) {
    const dispatch = useDispatch();

    const handleClick = React.useCallback(() => {
        dispatch(rememberPresetColumnsAsDefault());
    }, [dispatch]);

    return (
        <Tooltip content={'Remember columns for the table'}>
            <Button {...props} pin={'clear-round'} onClick={handleClick}>
                <Icon awesome={'save'} />
            </Button>
        </Tooltip>
    );
}

function ColumnsPresetButton(props: Props) {
    const hash = useSelector(getColumnsPresetHash);

    return hash ? <SavePresetButton {...props} /> : <SharePresetButton {...props} />;
}

export default React.memo(ColumnsPresetButton);
