import React from 'react';
import omit_ from 'lodash/omit';
import {type OpenAttributesModalParams} from '../../../store/actions/modals/attributes-modal';

import AttributesButton, {type AttributesButtonProps} from '../AttributesButton';

import i18n from '../i18n';

type Props = Omit<AttributesButtonProps, 'onClick' | 'title'> & OpenAttributesModalParams;

export function ClickableAttributesButtonBase(
    props: Props & {
        openAttributesModal: (params: OpenAttributesModalParams) => void;
    },
) {
    const {
        openAttributesModal,
        withTooltip = true,
        tooltipProps = {placement: 'bottom-end', content: i18n('tooltip-content')},
    } = props;
    return (
        <AttributesButton
            {...omit_(props, [
                'title',
                'path',
                'exactPath',
                'attribute',
                'attributes',
                'openAttributesModal',
            ])}
            tooltipProps={tooltipProps}
            withTooltip={withTooltip}
            onClick={() => openAttributesModal(props)}
        />
    );
}
