import React, {FocusEvent} from 'react';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {Flex} from '@gravity-ui/uikit';

import {WidgetSkeleton} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetSkeleton/WidgetSkeleton';
import PathEditor from '../../../../../../containers/PathEditor/PathEditor';

import {useNavigationWidget} from '../hooks/use-navigation-widget';
import type {NavigationWidgetProps} from '../types';

import {NavigationWidgetContentBase} from './NavigationWidgetContentBase';
import {getCluster} from '../../../../../../store/selectors/global';

export function NavigationWidgetContent(props: NavigationWidgetProps) {
    const {type, items, isLoading, error, showNavigationInput} = useNavigationWidget(props);

    return (
        <Flex width={'100%'} direction={'column'} gap={2}>
            {showNavigationInput && <DashboardPathEditor />}
            {isLoading ? (
                <WidgetSkeleton itemHeight={30} />
            ) : (
                <NavigationWidgetContentBase pathsType={type} items={items || []} error={error} />
            )}
        </Flex>
    );
}

function DashboardPathEditor() {
    const history = useHistory();
    const cluster = useSelector(getCluster);

    const handleApply = (path: string) => {
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;

        const navigationUrl = `/${cluster}/navigation?path=${normalizedPath}`;
        history.push(navigationUrl);
    };

    const handleFocus = React.useCallback((event: FocusEvent<HTMLInputElement>) => {
        event.target?.select();
    }, []);

    return (
        <PathEditor
            hasConfirmButton
            autoFocus
            defaultPath={''}
            placeholder={'Enter the path to navigate...'}
            onApply={handleApply}
            onFocus={handleFocus}
        />
    );
}
