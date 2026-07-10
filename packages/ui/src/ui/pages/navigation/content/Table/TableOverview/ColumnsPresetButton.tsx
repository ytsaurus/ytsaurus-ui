import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';

import {Tooltip} from '@ytsaurus/components';
import Button, {type ButtonProps} from '../../../../../components/Button/Button';
import {
    openTableWithPresetOfColumns,
    rememberPresetColumnsAsDefault,
} from '../../../../../store/actions/navigation/content/table/table';
import Icon from '../../../../../components/Icon/Icon';
import {selectColumnsPresetHash} from '../../../../../store/selectors/navigation/content/table-ts';
import i18n from './i18n';

type Props = Required<Pick<ButtonProps, 'view' | 'disabled'>>;

function SharePresetButton(props: Props) {
    const dispatch = useDispatch();

    const handleClick = React.useCallback(() => {
        dispatch(openTableWithPresetOfColumns());
    }, [dispatch]);

    return (
        <Tooltip content={i18n('context_share-columns')}>
            <Button
                {...props}
                pin={'clear-round'}
                onClick={handleClick}
                qa="table-columns-share-button"
            >
                <Icon awesome={'share'} size={13} />
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
        <Tooltip content={i18n('context_remember-columns')}>
            <Button {...props} pin={'clear-round'} onClick={handleClick}>
                <Icon awesome={'save'} size={13} />
            </Button>
        </Tooltip>
    );
}

function ColumnsPresetButton(props: Props) {
    const hash = useSelector(selectColumnsPresetHash);

    return hash ? <SavePresetButton {...props} /> : <SharePresetButton {...props} />;
}

export default React.memo(ColumnsPresetButton);
