import React from 'react';
import {ConnectedProps, connect} from 'react-redux';

import {openAttributesModal} from '../../store/actions/modals/attributes-modal';
import {ButtonProps} from '../../components/Button/Button';

import AttributesButton, {AttributesButtonProps} from './AttributesButton';

import i18n from './i18n';

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

function ClickableAttributesButton({
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
}: Props & ConnectedProps<typeof connector>) {
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

const connector = connect(null, {openAttributesModal});

export default connector(ClickableAttributesButton);
