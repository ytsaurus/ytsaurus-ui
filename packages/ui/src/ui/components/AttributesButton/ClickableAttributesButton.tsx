import React from 'react';
import {connect, ConnectedProps} from 'react-redux';

import AttributesButton, {AttributesButtonProps} from './AttributesButton';

import {openAttributesModal} from '../../store/actions/modals/attributes-modal';
import {ButtonProps} from '../Button/Button';

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
    tooltipProps = {placement: 'bottom-end', content: 'Show attributes'},
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
