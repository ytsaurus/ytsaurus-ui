import React from 'react';
import {type ButtonProps} from '../../Button/Button';

import AttributesButton, {type AttributesButtonProps} from '../AttributesButton';

import i18n from '../i18n';

interface Props extends Omit<AttributesButtonProps, 'onClick' | 'title'> {
    title: React.ReactNode;

    // The function is called inside click handler, and overrides path and exactPath
    getPathProps?: () => Pick<Partial<Props>, 'path' | 'exactPath'>;
    path?: string;
    exactPath?: string;

    attribute?: string;
    attributes?: object;

    size?: ButtonProps['size'];
    view?: ButtonProps['view'];
}

export function ClickableAttributesButtonBase({
    title,
    getPathProps = () => {
        return {};
    },
    path,
    exactPath,
    attribute,
    attributes,
    openAttributesModal,
    withTooltip = true,
    tooltipProps = {placement: 'bottom-end', content: i18n('tooltip-content')},
    // Extract potentially problematic props
    ...rest
}: Props & {
    openAttributesModal: (args_0: {
        title: React.ReactNode;
        path?: string;
        exactPath?: string;
        attribute?: string;
        attributes?: object;
    }) => void;
}) {
    return (
        <AttributesButton
            {...rest}
            tooltipProps={tooltipProps}
            withTooltip={withTooltip}
            onClick={() => {
                const pathProps = {
                    path,
                    exactPath,
                    ...getPathProps(),
                };

                openAttributesModal({
                    title,
                    ...pathProps,
                    attribute,
                    attributes,
                });
            }}
        />
    );
}
