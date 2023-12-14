import React from 'react';
import {useDispatch} from 'react-redux';

import withSplit from '../../../hocs/withSplit';
import withLazyLoading from '../../../hocs/withLazyLoading';
import type {QueryWidgetProps} from './index';
import {mergeScreen, splitScreen} from '../../../store/actions/global';
import {SPLIT_TYPE} from '../../../constants/components/nodes/nodes';
import Loader from '../../../components/Loader/Loader';

export const QueryWidgetLazy = React.lazy(() => import('./index'));

export const QueryWidgetPortal = withSplit(
    withLazyLoading<QueryWidgetProps>(QueryWidgetLazy, <Loader visible centered size="l" />),
);

export function useQueryWidgetSidePanel() {
    const [widgetOpened, setWidgetOpened] = React.useState(false);
    const dispatch = useDispatch();

    const openWidget = React.useCallback(() => {
        dispatch(splitScreen(SPLIT_TYPE));
        setWidgetOpened(true);
    }, [setWidgetOpened, dispatch]);

    const onClose = React.useCallback(() => {
        setWidgetOpened(false);
        dispatch(mergeScreen());
    }, [setWidgetOpened, dispatch]);

    return {
        closeWidget: onClose,
        openWidget,
        widgetOpened,
        widgetContent: widgetOpened ? <QueryWidgetPortal onClose={onClose} /> : null,
    };
}
