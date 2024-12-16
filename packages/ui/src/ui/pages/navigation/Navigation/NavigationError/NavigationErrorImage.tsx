import React from 'react';
import {Icon} from '@gravity-ui/uikit';
import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import ErrorImage901 from '../../../../assets/img/svg/901.svg';
import ErrorImage500 from '../../../../assets/img/svg/500.svg';
import {ErrorCode} from './helpers';

type Props = {
    type: ErrorCode;
};

type ImageMap = {
    [key in ErrorCode]: SVGIconData;
};

const ErrorImages: ImageMap = {
    500: ErrorImage500,
    901: ErrorImage901,
};

export function NavigationErrorImage(props: Props) {
    const {type} = props;

    const ErrorImage = ErrorImages[type];

    return <Icon data={ErrorImage} size={150} />;
}
