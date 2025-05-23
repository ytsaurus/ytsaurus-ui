import {createSelector} from 'reselect';

import compact_ from 'lodash/compact';
import filter_ from 'lodash/filter';
import flatten_ from 'lodash/flatten';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import sortBy_ from 'lodash/sortBy';
import uniq_ from 'lodash/uniq';
import partition_ from 'lodash/partition';
import isEqual_ from 'lodash/isEqual';
import some_ from 'lodash/some';

import {calculateLoadingStatus} from '../../utils/utils';
import {concatByAnd} from '../../common/hammer/predicate';
import {
    getAclFilterColumnGroupName,
    getAclFilterColumns,
    getAclFilterExpandedSubjects,
    getApproversSubjectFilter,
    getObjectPermissionsFilter,
    getObjectSubjectFilter,
} from './acl-filters';
import UIFactory from '../../UIFactory';
import {RootState} from '../../store/reducers';
import {IdmKindType, PreparedAclSubject} from '../../utils/acl/acl-types';
import {YTPermissionTypeUI} from '../../utils/acl/acl-api';
import {PreparedRole} from '../../utils/acl';

export type PreparedAclSubjectColumn = Omit<PreparedAclSubject, 'type'> & {type: 'columns'};

function prepareColumnsNames(columnsPermissions: Array<{columns?: Array<string>}>) {
    const columns = map_(columnsPermissions, (permission) => permission.columns);

    return compact_(uniq_(flatten_(columns))).sort();
}

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
                    ? {name: subject.group_name, url: subject.url, group: undefined}
                    : undefined,
            action: undefined,
        };
        return {
            ...subject,
            ...extra,
        };
    });
}

export type PreparedApprover = ReturnType<typeof prepareApprovers>[number];

export const getAllUserPermissions = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].userPermissions;
const getAllObjectPermissions = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].objectPermissions;

const getAllObjectPermissionsWithSplittedSubjects = createSelector(
    [getAllObjectPermissions],
    splitSubjects,
);

export const getObjectPermissionsTypesList = (idmKind: IdmKindType) => {
    return createSelector(
        [
            getObjectPermissionsFilter,
            (state) => getAllObjectPermissionsWithSplittedSubjects(state, idmKind),
        ],
        (permissionsFilter, items) => {
            const uniquePermisions = new Set<YTPermissionTypeUI>();
            const {permissionTypes} = UIFactory.getAclPermissionsSettings()[idmKind] || {};
            [...permissionTypes, ...permissionsFilter].forEach((permission) =>
                uniquePermisions.add(permission),
            );
            items.forEach((item) => {
                const {permissions} = item;
                permissions?.forEach((permission) => uniquePermisions.add(permission));
            });
            return sortBy_([...uniquePermisions], (permission) => permission);
        },
    );
};

type HasSplitted = {
    isSplitted?: boolean;
    subjectIndex?: number;
};

function splitSubjects<T extends {subjects: Array<unknown>}>(items: Array<T>) {
    const res: Array<T & HasSplitted> = [];
    forEach_(items, (item) => {
        const {subjects} = item;
        if (subjects && subjects.length > 1) {
            forEach_(subjects, (subject, index) => {
                res.push({...item, subjects: [subject], isSplitted: true, subjectIndex: index});
            });
        } else {
            res.push(item);
        }
    });
    return res;
}

function subjectFilterPredicate<
    T extends {subjectType?: unknown; groupInfo?: unknown; subjects: Array<unknown>},
>(item: T, filter: string) {
    const {subjectType, groupInfo} = item;
    if (subjectType === 'group') {
        return some_(Object.entries(groupInfo ?? {}), ([key, value]) => {
            let str: string | undefined = String(value);
            if (key === 'url') {
                if (str[str.length - 1] === '/') str = str.slice(0, -1);
                str = str.split('/').pop();
            }
            return -1 !== str?.toLowerCase().indexOf(filter);
        });
    }
    const value = String(item.subjects[0] ?? '');
    return -1 !== value.toLowerCase().indexOf(filter);
}

function FilterBySubject<
    T extends {subjectType?: unknown; groupInfo?: unknown; subjects: Array<unknown>},
>(items: Array<T>, subjectFilter?: string) {
    if (!subjectFilter) return items;
    const lowerNameFilter = subjectFilter.toLowerCase();
    return filter_(items, (item) => subjectFilterPredicate(item, lowerNameFilter));
}

const permissionsFilterPredicate = (item: PreparedAclSubject, filter: Set<YTPermissionTypeUI>) => {
    const {permissions} = item;
    let foundCount = 0;
    return permissions?.some((p) => {
        if (filter.has(p)) {
            foundCount++;
        }
        return foundCount >= filter.size;
    });
};

type ObjectPermissionsRow = PreparedAclSubject & HasSplitted;

export const getAllObjectPermissionsFiltered = createSelector(
    [
        getAllObjectPermissionsWithSplittedSubjects,
        getObjectSubjectFilter,
        getObjectPermissionsFilter,
        getAclFilterColumns,
    ],
    (items, subjectFilter, permissionsFilter, columns) => {
        const [mainPermissions, columnPermissions] = partition_(
            items,
            (item) => !item.columns?.length,
        );

        const withColumns = columnPermissions.map((item) => {
            return {...item, columns: sortBy_(item.columns)};
        });

        const lowerNameFilter = subjectFilter?.toLocaleLowerCase();
        const filterBySubject = lowerNameFilter
            ? (item: ObjectPermissionsRow) => subjectFilterPredicate(item, lowerNameFilter)
            : undefined;

        const permissionsFilterSet = new Set<YTPermissionTypeUI>(permissionsFilter);
        const filterByPermissions = permissionsFilterSet.size
            ? (item: ObjectPermissionsRow) =>
                  permissionsFilterPredicate(item, permissionsFilterSet) ?? false
            : undefined;

        const visibleColumns = new Set(columns);
        const filterByColumns = visibleColumns.size
            ? ({columns}: ObjectPermissionsRow) => {
                  return columns?.some((colName) => visibleColumns.has(colName)) ?? false;
              }
            : undefined;

        const mainPredicates = compact_([filterBySubject, filterByPermissions]);
        const columnsPredicates = compact_([filterBySubject, filterByColumns]);
        return {
            mainPermissions: mainPredicates.length
                ? mainPermissions.filter(concatByAnd(...mainPredicates))
                : mainPermissions,
            columnsPermissions: columnsPredicates.length
                ? withColumns.filter(concatByAnd(...columnsPredicates))
                : withColumns,
        };
    },
);

export const getObjectPermissionsAggregated = createSelector(
    [getAllObjectPermissionsFiltered, getAclFilterExpandedSubjects],
    ({mainPermissions, columnsPermissions}, expandedSubjects) => {
        return {
            mainPermissions: {
                ...aggregateBySubject(mainPermissions, expandedSubjects),
                count: mainPermissions.length,
            },
            columnsPermissions: {
                ...aggregateBySubject(columnsPermissions, expandedSubjects),
                count: columnsPermissions.length,
            },
        };
    },
);

class AggregateBySubject {
    aggrKey: string;
    subject: ObjectPermissionsRow['subjects'][number];
    inherited: boolean;

    allPermissions = new Set<YTPermissionTypeUI>();
    columns = new Set<string>();
    first: ObjectPermissionsRow;
    children = new Array<ObjectPermissionsRow & {expanded?: boolean; level?: number}>();

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

        if (item.subjects.length !== 1) {
            throw new Error(
                `Unexpected behavior: item.subjects.length !== 1: ${JSON.stringify(item)}`,
            );
        }

        const child = {...item, permissions: [...(item.permissions ?? [])]};
        this.children.push(child);

        child.permissions?.sort();
        child.permissions?.forEach((p) => {
            this.allPermissions.add(p);
        });
        item.columns?.forEach((column) => this.columns.add(column));

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

        const first: typeof this.first & {level?: number; expanded?: boolean} = {
            ...this.first,
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

function aggregateBySubject(
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

export const getAllObjectPermissionsOrderedByStatus = createSelector(
    [getAllObjectPermissions],
    OrderByRoleStatus,
);
export const getAllColumnGroups = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].columnGroups;
export const getAllColumnGroupsActual = createSelector(
    [getAllColumnGroups, getAclFilterColumns, getAclFilterColumnGroupName],
    (items, columnsFilter, nameFilter) => {
        const visibleColumns = new Set(columnsFilter);
        type ItemType = (typeof items)[number];
        const nameFilterLower = nameFilter?.toLowerCase();
        const predicates = compact_([
            (item: ItemType) => {
                return !item.removed;
            },
            visibleColumns.size > 0
                ? (item: ItemType) => {
                      return item.columns?.some((name) => visibleColumns.has(name)) ?? false;
                  }
                : undefined,
            nameFilterLower?.length
                ? (item: ItemType) =>
                      -1 !== (item.name?.toLowerCase()?.indexOf(nameFilterLower) ?? -1)
                : undefined,
        ]);
        const filtered = filter_(items, concatByAnd(...predicates)).map((item) => {
            return {...item, columns: sortBy_(item.columns)};
        });
        return sortBy_(filtered, ['name']);
    },
);

function OrderByRoleStatus<
    T extends {
        isDepriving?: boolean;
        isRequested?: boolean;
        isUnrecognized?: boolean;
        isApproved?: boolean;
    },
>(items: Array<T>) {
    const unrecognized: typeof items = [];
    const requested: typeof items = [];
    const depriving: typeof items = [];
    const rest: typeof items = [];
    forEach_(items, (item) => {
        const {isDepriving, isRequested, isUnrecognized, isApproved} = item;
        if (isUnrecognized) {
            unrecognized.push(item);
        } else if (isDepriving) {
            depriving.push(item);
        } else if (isRequested || isApproved) {
            requested.push(item);
        } else {
            rest.push(item);
        }
    });
    return [...requested, ...depriving, ...unrecognized, ...rest];
}

function OrderByInheritanceAndSubject<T extends {inherited?: boolean; subjects: Array<unknown>}>(
    items: Array<T>,
) {
    const res = sortBy_(items, [
        (item) => !item.inherited,
        (item) => (item.subjects && item.subjects[0]) || true,
    ]);
    return res;
}

const getReadApprovers = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].readApprovers;
const getResponsibles = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].responsible;
const getAuditors = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].auditors;

export const getNotInheritedReadApprovers = createSelector([getReadApprovers], (readApprovers) =>
    filter_(readApprovers, (readApprover) => !readApprover.inherited),
);
export const getNotInheritedResponsibles = createSelector([getResponsibles], (responsibles) =>
    filter_(responsibles, (responsible) => !responsible.inherited),
);
export const getNotInheritedAuditors = createSelector([getAuditors], (auditros) =>
    filter_(auditros, (auditro) => !auditro.inherited),
);

const getAllApprovers = createSelector(
    [getReadApprovers, getResponsibles, getAuditors],
    (readApprovers, responsibles, auditros) => {
        return [
            ...prepareApprovers(readApprovers, 'read_approver'),
            ...prepareApprovers(responsibles, 'responsible'),
            ...prepareApprovers(auditros, 'auditor'),
        ];
    },
);

export const getHasApprovers = createSelector([getAllApprovers], (items) => items.length > 0);

export const getApproversFiltered = createSelector(
    [getAllApprovers, getApproversSubjectFilter],
    FilterBySubject,
);

export const getApproversFilteredAndOrdered = createSelector(
    [getApproversFiltered],
    OrderByInheritanceAndSubject,
);

export const getApprovers = createSelector([getAllApprovers], OrderByRoleStatus);

export const getAllAccessColumnsPermissions = createSelector(
    [getAllObjectPermissions],
    (objectPermissions) => {
        const filteredPermissions = filter_(
            objectPermissions,
            (permission) => permission.action === 'allow' && permission.columns?.length! > 0,
        );

        return map_(filteredPermissions, (item) => {
            const tmp: typeof item = {...item};
            tmp.type = 'columns';
            return tmp;
        });
    },
);

const getAllDenyColumnsPermissions = createSelector(
    [getAllObjectPermissions],
    (objectPermissions) => {
        const filteredPermissions = filter_(
            objectPermissions,
            (permission) => permission.action === 'deny' && permission.columns?.length! > 0,
        );

        return map_(
            filteredPermissions,
            (permission) =>
                ({
                    ...permission,
                    type: 'columns',
                }) as PreparedAclSubjectColumn,
        );
    },
);

export const getAllAccessColumnsNames = createSelector(
    [getAllAccessColumnsPermissions],
    prepareColumnsNames,
);

export const getAllDenyColumnsNames = createSelector(
    [getAllDenyColumnsPermissions],
    prepareColumnsNames,
);

export const getDenyColumnsItems = createSelector([getAllDenyColumnsNames], (names) =>
    map_(names, (name) => ({key: name, value: name, title: name})),
);

export const isPermissionDeleted = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].isPermissionDeleted;
export const permissionDeletionError = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].deletionError;
export const getLastDeletedPermissionKey = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].deletedItemKey;
export const getIdmPermissionsRequestError = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].idmPermissionsRequestError;
export const getIdmManageAclRequestError = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].idmManageAclRequestError;
export const getIdmPathVersion = (state: RootState, idmKind: IdmKindType) =>
    state.acl[idmKind].version;

const getAclLoading = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].loading;
const getAclLoaded = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].loaded;
const getAclError = (state: RootState, idmKind: IdmKindType) => state.acl[idmKind].error;

export const getAclLoadState = createSelector(
    [getAclLoading, getAclLoaded, getAclError],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
