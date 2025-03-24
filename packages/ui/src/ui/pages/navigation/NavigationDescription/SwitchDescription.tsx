import React from 'react';
import {Flex, Link, Switch} from '@gravity-ui/uikit';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';

import UIFactory from '../../../UIFactory';

interface Props {
    checked: boolean;
    annotationLink?: string;
    onUpdate: (checked: boolean) => void;
}

export function SwitchDescription({checked, annotationLink, onUpdate}: Props) {
    return (
        <Flex direction={'row'} gap={1}>
            <Switch size="m" checked={checked} onUpdate={onUpdate}>
                Show {UIFactory.externalAnnotationSetup?.externalServiceName || 'external'} content
            </Switch>
            {annotationLink && (
                <Link href={annotationLink} target={'_blank'}>
                    <ArrowUpRightFromSquare />
                </Link>
            )}
        </Flex>
    );
}
