import {Checkbox} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import indexOf_ from 'lodash/indexOf';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import React, {Component} from 'react';
import i18nPermissionValues from '../../../../containers/ACL/i18n-permission-values';
import {YTPermissionTypeUI} from '../../../../utils/acl/acl-api';
import './PermissionsControl.scss';

const block = cn('acl-permissions-control');

interface Props {
    value: Record<string, Array<YTPermissionTypeUI>>;
    onChange: (value: Props['value']) => void;
    disabled?: boolean;
    choices?: Array<Array<YTPermissionTypeUI>>;
    disabledChoices?: Array<number>; // array of indices
    validate?: (value: Props['value']) => string | undefined;

    error?: string;
}

interface State {
    errorMessage?: string;
}

export default class PermissionsControl extends Component<Props, State> {
    static getChoiceName(choice: Array<string>) {
        return choice.join('/');
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    static hasErrorRenderer = true;

    static getDefaultValue = () => ({});
    static isEmpty(value: Props['value']) {
        return isEmpty_(value);
    }

    state: State = {};

    handleCheckboxChange = (
        permissionName: string,
        permissionsToSet: Array<YTPermissionTypeUI>,
    ) => {
        const {value, onChange} = this.props;
        const {[permissionName]: permissions, ...rest} = value || {};

        const updatedValue = permissions ? rest : {...rest, [permissionName]: permissionsToSet};
        onChange(updatedValue);
    };

    renderPermissionCheckbox(
        permissionName: string,
        permissionsToSet: Array<YTPermissionTypeUI>,
        index: number,
    ) {
        const {value, disabled, disabledChoices} = this.props;
        const itemDisabled = disabled || indexOf_(disabledChoices, index) !== -1;

        const content = permissionsToSet
            .map((item) => {
                return i18nPermissionValues(`value_${item}`);
            })
            .join('/');

        return (
            <Checkbox
                checked={Boolean(value?.[permissionName])}
                key={permissionName}
                content={content}
                onChange={() => this.handleCheckboxChange(permissionName, permissionsToSet)}
                disabled={itemDisabled}
                className={block('item')}
            />
        );
    }

    renderChoices(choices?: Required<Props>['choices']) {
        return map_(choices, (item, index) => {
            const name = PermissionsControl.getChoiceName(item);
            return (
                <React.Fragment key={index}>
                    {this.renderPermissionCheckbox(name, item, index)}
                </React.Fragment>
            );
        });
    }

    render() {
        const {choices, error} = this.props;

        return (
            <div className={block()}>
                {this.renderChoices(choices)}
                {error && <div className={block('error-message')}>{error}</div>}
            </div>
        );
    }
}
