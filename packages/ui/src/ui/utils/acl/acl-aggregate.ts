import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';
import partition_ from 'lodash/partition';
import sortBy_ from 'lodash/sortBy';

import {HasSplitted, type PreparedRole} from '../../utils/acl';
import {type YTPermissionTypeUI} from '../../utils/acl/acl-api';
import {type PreparedAclSubject} from '../../utils/acl/acl-types';

export type PreparedAclSubjectColumn = Omit<PreparedAclSubject, 'type'> & {type: 'columns'};

function prepareApprovers(
    approvers: Array<PreparedRole> | undefined,
    type: 'read_approver' | 'responsible' | 'auditor',
) {
    return map_(approvers, (subject) => {
        const extra = {
            type,
            subjects: [subject.value],
            subjectType: subject.type === 'users' ? ('user' as const) : ('group' as const),
            groupInfo:
                subject.type === 'groups'
                    ? {name: subject.group_name, url: subject.url, group: subject.group}
                    : undefined,
            action: undefined,
        };
        return {
            ...subject,
            ...extra,
        };
    });
}

export type ObjectPermissionsRow = PreparedAclSubject & HasSplitted;

export type PreparedApprover = ReturnType<typeof prepareApprovers>[number];

type ObjectPermissionsRowAggregated = ObjectPermissionsRow & {
    expanded?: boolean;
    level?: number;
    expandable?: boolean;
    aggregated_row_access_predicates?: Array<string>;
};

class AggregateBySubject {
    aggrKey: string;
    subject: ObjectPermissionsRow['subjects'][number];
    inherited: boolean;

    allPermissions = new Set<YTPermissionTypeUI>();
    columns = new Set<string>();
    rowAccessPredicates = new Set<string>();
    first: ObjectPermissionsRowAggregated;
    children = new Array<ObjectPermissionsRowAggregated>();

    constructor(first: AggregateBySubject['first']) {
        if (first.subjects.length > 1) {
            throw new Error(
                `Unexpected behavior: more than one subject occured: ${first.subjects.join(',')}`,
            );
        }

        this.aggrKey = aggregationKey(first);
        this.inherited = Boolean(first.inherited);
        this.subject = first.subjects[0];
        this.first = {...first};
        this.add(first);
    }

    add(item: ObjectPermissionsRow) {
        const aggrKey = aggregationKey(item);
        if (this.aggrKey !== aggrKey) {
            throw new Error(
                `Unexpected behavior: aggregation keys are not queal: ${this.aggrKey} !== ${aggrKey}`,
            );
        }

        if (item.subjects.length > 1) {
            throw new Error(
                `Unexpected behavior: item.subjects.length > 1: ${JSON.stringify(item)}`,
            );
        }

        const child = {...item, permissions: [...(item.permissions ?? [])]};
        this.children.push(child);

        child.permissions?.sort();
        child.permissions?.forEach((p) => {
            this.allPermissions.add(p);
        });
        item.columns?.forEach((column) => this.columns.add(column));

        if (item.row_access_predicate) {
            this.rowAccessPredicates.add(item.row_access_predicate);
        }

        this.first.isMissing ||= Boolean(item.isMissing);
        this.first.isUnrecognized ||= Boolean(item.isUnrecognized);
        this.first.isApproved ||= Boolean(item.isApproved);
        this.first.isRequested ||= Boolean(item.isRequested);
    }

    getItems(expanded: boolean): {
        items: AggregateBySubject['children'];
        hasExpandable?: boolean;
        hasDenyAction?: boolean;
        hasInherited?: boolean;
    } {
        const hasInherited = this.inherited;
        if (this.children.length === 1) {
            return {items: this.children, hasInherited};
        }

        const first: typeof this.first = {
            ...this.first,
            aggregated_row_access_predicates: [...this.rowAccessPredicates].sort(),
            level: 0,
            expanded,
        };
        first.permissions = [...this.allPermissions].sort();
        first.columns = [...this.columns].sort();

        let hasDenyAction = false;
        const items = !expanded
            ? [first]
            : [
                  first,
                  ...sortBy_(this.children, ['inheritance_mode', 'permissions']).map((i) => {
                      hasDenyAction ||= i.action === 'deny';
                      return {...i, level: 1};
                  }),
              ];

        this.children.forEach((i) => {
            if (i.inheritance_mode !== first.inheritance_mode) {
                first.inheritance_mode = undefined;
            }
            if (!isEqual_(this.first.inheritedFrom, i.inheritedFrom)) {
                first.inheritedFrom = undefined;
            }
        });

        return {items, hasExpandable: true, hasDenyAction, hasInherited};
    }
}

export type ObjectPermissionRowWithExpand = AggregateBySubject['children'][number];

function aggregationKey(item: ObjectPermissionsRow) {
    const {
        inherited,
        subjects: [subject],
    } = item;
    return `subject:${subject}_inherited:${Boolean(inherited)}`;
}

export function aggregateBySubject(
    objPermissions: Array<ObjectPermissionsRow>,
    expandedSubjects: Set<string | number>,
) {
    const aggregated: Record<string, AggregateBySubject> = {};

    objPermissions.forEach((item) => {
        const aggKey = aggregationKey(item);
        const dst = aggregated[aggKey];
        if (!dst) {
            aggregated[aggKey] = new AggregateBySubject(item);
        } else {
            dst.add(item);
        }
    });

    const res = Object.values(aggregated).reduce(
        (acc, item) => {
            const {items, hasExpandable, hasInherited} = item.getItems(
                expandedSubjects.has(item.subject),
            );
            acc.items = acc.items.concat(items);
            acc.hasExpandable ||= hasExpandable;
            acc.hasInherited ||= hasInherited;
            return acc;
        },
        {items: []} as ReturnType<AggregateBySubject['getItems']>,
    );

    const [inherited, other] = partition_(res.items, (item) => item.inherited);

    return {
        ...res,
        items: [...inherited, ...other],
    };
}
