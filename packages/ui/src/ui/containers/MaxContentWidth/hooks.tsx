import React from 'react';
import {useDispatch} from 'react-redux';

import {setMaxContentWidthEnabled} from '../../store/actions/global/max-content-width';

export function useDisableMaxContentWidth() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(setMaxContentWidthEnabled(false));

        return () => {
            dispatch(setMaxContentWidthEnabled(true));
        };
    }, [dispatch]);
}

export function UseDisableMaxContentWidth() {
    useDisableMaxContentWidth();
    return null;
}

export function withDisableMaxContentWidth<Props extends object>(
    Component: React.ComponentType<Props>,
) {
    return function WithDisableMaxContentWidth(props: Props) {
        useDisableMaxContentWidth();
        return <Component {...props} />;
    };
}
