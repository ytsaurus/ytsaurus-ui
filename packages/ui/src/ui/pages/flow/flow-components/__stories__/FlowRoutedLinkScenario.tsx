import React from 'react';
import {useLocation} from 'react-router';

import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import {FlowRoutedStoryHarness} from '../FlowRoutedStoryHarness';

export function FlowRoutedLinkScenario() {
    const location = useLocation();
    return (
        <React.Fragment>
            <RoutedLink href="/test-cluster/flows/state">Open state</RoutedLink>
            <span data-testid="location">{location.pathname}</span>
        </React.Fragment>
    );
}

export function FlowRoutedLinkStory() {
    return (
        <FlowRoutedStoryHarness>
            <FlowRoutedLinkScenario />
        </FlowRoutedStoryHarness>
    );
}
