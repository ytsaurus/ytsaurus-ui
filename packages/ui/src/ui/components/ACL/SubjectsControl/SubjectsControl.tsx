import React from 'react';
import UIFactory from '../../../UIFactory';

export interface ValueWithType {
    value: string;
    type: SubjectsControlItemType;
    text?: string;
}

export type SubjectsControlItemType = 'users' | 'groups' | 'app';

export interface SubjectsControlProps {
    className?: string;
    value: Array<ValueWithType>;
    onChange: (value: SubjectsControlProps['value']) => void;
    placeholder?: string;
    allowedTypes?: Array<SubjectsControlItemType>;
}

export default class SubjectsControl extends React.Component<SubjectsControlProps> {
    static getDefaultValue() {
        return [];
    }

    static isEmpty(value: SubjectsControlProps['value']) {
        return !value || !value.length;
    }

    render() {
        return UIFactory.renderAclSubjectsSuggestControl(this.props);
    }
}
