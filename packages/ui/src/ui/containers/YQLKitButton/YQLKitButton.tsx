import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {RootState} from '../../store/reducers/index';
import {mergeScreen} from '../../store/actions/global';

import UIFactory from '../../UIFactory';

export function YQLKitButton({className}: {className?: string}) {
    const dispatch = useDispatch();
    const {isSplit} = useSelector((state: RootState) => state.global.splitScreen);

    React.useEffect(() => {
        return () => {
            dispatch(mergeScreen());
        };
    }, [dispatch]);

    return (
        <React.Fragment>
            {UIFactory.yqlWidgetSetup?.renderButton({isSplit, className})}
        </React.Fragment>
    );
}
