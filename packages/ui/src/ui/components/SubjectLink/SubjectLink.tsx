import {SubjectGroupType} from '../../utils/acl';
import UIFactory from '../../UIFactory';

export type SubjectCardProps = {
    className?: string;
    noLink?: boolean;
    showIcon?: boolean;

    internal?: boolean;
    url?: string;

    name: string | number;
    type?: 'user' | 'group' | 'tvm';
    groupType?: SubjectGroupType;
};

export function SubjectCard(props: SubjectCardProps) {
    return UIFactory.renderSubjectCard(props);
}
