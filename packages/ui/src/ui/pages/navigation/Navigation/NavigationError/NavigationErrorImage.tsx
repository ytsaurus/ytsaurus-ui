import React from 'react';
import {Icon} from '@gravity-ui/uikit';
import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import {AccessDenied, NoSearchResults} from '@gravity-ui/illustrations';
import {ErrorCode} from './helpers';

type Props = {
    type: ErrorCode;
};

type ImageMap = {
    [key in ErrorCode]: SVGIconData;
};

const ErrorImages: ImageMap = {
    500: NoSearchResults,
    901: AccessDenied,
};

export function NavigationErrorImage(props: Props) {
    const {type} = props;

    const ErrorImage = ErrorImages[type];

    return <Icon data={ErrorImage} size={150} />;
}
