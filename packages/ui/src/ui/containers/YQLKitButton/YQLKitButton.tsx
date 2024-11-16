import React from 'react';
import {useDispatch} from 'react-redux';

import {mergeScreen} from '../../store/actions/global';

import UIFactory, {YQLButtonProps} from '../../UIFactory';

export function YQLKitButton(props: YQLButtonProps) {
    const dispatch = useDispatch();

    React.useEffect(() => {
        return () => {
            dispatch(mergeScreen());
        };
    }, [dispatch]);

    return <React.Fragment>{UIFactory.yqlWidgetSetup?.renderButton(props)}</React.Fragment>;
}
