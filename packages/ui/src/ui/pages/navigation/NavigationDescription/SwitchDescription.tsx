import React from 'react';
import {Flex, Link, Popover, Switch} from '@gravity-ui/uikit';

import UIFactory from '../../../UIFactory';
import {CircleInfo} from '@gravity-ui/icons';

interface Props {
    checked: boolean;
    annotationLink?: string;
    onUpdate: (checked: boolean) => void;
}

export function SwitchDescription({checked, annotationLink, onUpdate}: Props) {
    return (
        <Flex direction={'row'} gap={1}>
            <Switch size="m" checked={checked} onUpdate={onUpdate}>
                Show {UIFactory.externalAnnotationSetup.externalServiceName || 'external'} content
            </Switch>
            {annotationLink && (
                <Popover
                    content={
                        <Link href={annotationLink}>
                            {UIFactory.externalAnnotationSetup.externalServiceName || 'External'}
                        </Link>
                    }
                >
                    <CircleInfo />
                </Popover>
            )}
        </Flex>
    );
}
