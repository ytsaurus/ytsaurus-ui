import React, {Component} from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Checkbox} from '@gravity-ui/uikit';

import './PermissionsControl.scss';

const block = cn('acl-permissions-control');

interface Props {
    value: Record<string, Array<string>>;
    onChange: (value: Props['value']) => void;
    disabled?: boolean;
    choices?: Array<Array<string>>;
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
        return _.isEmpty(value);
    }

    state: State = {};

    handleCheckboxChange = (permissionName: string, permissionsToSet: Array<string>) => {
        const {value, onChange} = this.props;
        const {[permissionName]: permissions, ...rest} = value || {};

        const updatedValue = permissions ? rest : {...rest, [permissionName]: permissionsToSet};
        onChange(updatedValue);
    };

    renderPermissionCheckbox(
        permissionName: string,
        permissionsToSet: Array<string>,
        index: number,
    ) {
        const {value, disabled, disabledChoices} = this.props;
        const itemDisabled = disabled || _.indexOf(disabledChoices, index) !== -1;

        return (
            <Checkbox
                checked={Boolean(value?.[permissionName])}
                key={permissionName}
                content={permissionName}
                onChange={() => this.handleCheckboxChange(permissionName, permissionsToSet)}
                disabled={itemDisabled}
                className={block('item')}
            />
        );
    }

    renderChoices(choices?: Required<Props>['choices']) {
        return _.map(choices, (item, index) => {
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
