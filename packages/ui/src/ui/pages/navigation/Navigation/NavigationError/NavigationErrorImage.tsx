import React from 'react';
import ErrorImage500 from '../../../../assets/img/svg/901.svg';
import ErrorImage901 from '../../../../assets/img/svg/500.svg';
import {Icon} from '@gravity-ui/uikit';
import {SVGIconData} from '@gravity-ui/uikit/build/esm/components/Icon/types';
import {ErrorName} from './helpers';

type Props = {
    type: ErrorName;
};

type ImageMap = {
    [key in ErrorName]: SVGIconData;
};

const ErrorImages: ImageMap = {
    ACCESS_DENIED: ErrorImage500,
    INCORRECT_PATH: ErrorImage901,
    EXIST: '',
    NETWORK_ERROR: '',
    MOUNT_ERROR: '',
    NODE_COUNT_LIMIT: '',
};

function NavigationErrorImage(props: Props) {
    const {type} = props;

    const ErrorImage = ErrorImages[type];

    return <Icon data={ErrorImage} size={150} />;
}

export default NavigationErrorImage;
