import {createSelector} from 'reselect';
import _ from 'lodash';
import partition from 'lodash/partition';
import compact from 'lodash/compact';
import sortBy from 'lodash/sortBy';
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
    const columns = _.map(columnsPermissions, (permission) => permission.columns);

    return _.compact(_.uniq(_.flatten(columns))).sort();
}

function prepareApprovers(
    approvers: Array<PreparedRole> | undefined,
    type: 'read_approver' | 'responsible' | 'auditor',
) {
    return _.map(approvers, (subject) => {
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
            return _.sortBy([...uniquePermisions], (permission) => permission);
        },
    );
};

type HasSplitted = {
    isSplitted?: boolean;
    subjectIndex?: number;
};

function splitSubjects<T extends {subjects: Array<unknown>}>(items: Array<T>) {
    const res: Array<T & HasSplitted> = [];
    _.forEach(items, (item) => {
        const {subjects} = item;
        if (subjects && subjects.length > 1) {
            _.forEach(subjects, (subject, index) => {
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
        return _.some(Object.entries(groupInfo ?? {}), ([key, value]) => {
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
    return _.filter(items, (item) => subjectFilterPredicate(item, lowerNameFilter));
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
        const [mainPermissions, columnPermissions] = partition(
            items,
            (item) => !item.columns?.length,
        );

        const withColumns = columnPermissions.map((item) => {
            return {...item, columns: sortBy(item.columns)};
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

        const mainPredicates = compact([filterBySubject, filterByPermissions]);
        const columnsPredicates = compact([filterBySubject, filterByColumns]);
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
    allPermissions = new Set<YTPermissionTypeUI>();
    columns = new Set<string>();
    children = new Array<ObjectPermissionsRow & {expanded?: boolean; level?: number}>();

    subject: string | number;

    constructor(subject: AggregateBySubject['subject']) {
        this.subject = subject;
    }

    add(item: ObjectPermissionsRow) {
        if (this.subject !== item.subjects[0] || item.subjects.length !== 1) {
            throw new Error(
                `Unexpected behavior: subjects should be the same: ${
                    this.subject
                } !== ${item.subjects.join(',')}`,
            );
        }

        this.children.push(item);
        item.permissions?.forEach((p) => {
            this.allPermissions.add(p);
        });
        item.columns?.forEach((column) => this.columns.add(column));
    }

    getItems(expanded: boolean): {
        items: AggregateBySubject['children'];
        hasExpandable?: boolean;
        hasDenyAction?: boolean;
    } {
        if (this.children.length <= 1) {
            return {items: this.children};
        }

        const first: (typeof this.children)[0] & {level?: number; expanded?: boolean} = {
            ...this.children[0],
            level: 0,
            expanded,
        };
        first.inheritance_mode = undefined;
        first.inherited = undefined;
        first.permissions = [...this.allPermissions];
        first.columns = [...this.columns];

        let hasDenyAction = false;
        const items = !expanded
            ? [first]
            : [
                  first,
                  ...this.children.map((i) => {
                      hasDenyAction ||= i.action === 'deny';
                      return {...i, level: 1};
                  }),
              ];

        return {items, hasExpandable: true, hasDenyAction};
    }
}

export type ObjectPermissionRowWithExpand = AggregateBySubject['children'][number];

function aggregateBySubject(
    objPermissions: Array<ObjectPermissionsRow>,
    expandedSubjects: Set<string | number>,
) {
    const aggregated: Record<AggregateBySubject['subject'], AggregateBySubject> = {};

    objPermissions.forEach((item) => {
        const [subject] = item.subjects;
        const agg = aggregated[subject] ?? (aggregated[subject] = new AggregateBySubject(subject));
        agg.add(item);
    });

    const items = Object.values(aggregated).reduce(
        (acc, item) => {
            const {items, hasExpandable} = item.getItems(expandedSubjects.has(item.subject));
            acc.items = acc.items.concat(items);
            acc.hasExpandable ||= hasExpandable;
            return acc;
        },
        {items: [], hasExpandable: false} as ReturnType<AggregateBySubject['getItems']>,
    );

    return items;
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
        const predicates = _.compact([
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
                      -1 !== item.name?.toLowerCase().indexOf(nameFilterLower) ?? false
                : undefined,
        ]);
        const filtered = _.filter(items, concatByAnd(...predicates));
        return _.sortBy(filtered, ['name']);
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
    _.forEach(items, (item) => {
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
    const res = _.sortBy(items, [
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
    _.filter(readApprovers, (readApprover) => !readApprover.inherited),
);
export const getNotInheritedResponsibles = createSelector([getResponsibles], (responsibles) =>
    _.filter(responsibles, (responsible) => !responsible.inherited),
);
export const getNotInheritedAuditors = createSelector([getAuditors], (auditros) =>
    _.filter(auditros, (auditro) => !auditro.inherited),
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
        const filteredPermissions = _.filter(
            objectPermissions,
            (permission) => permission.action === 'allow' && permission.columns?.length! > 0,
        );

        return _.map(filteredPermissions, (item) => {
            const tmp: typeof item = {...item};
            tmp.type = 'columns';
            return tmp;
        });
    },
);

const getAllDenyColumnsPermissions = createSelector(
    [getAllObjectPermissions],
    (objectPermissions) => {
        const filteredPermissions = _.filter(
            objectPermissions,
            (permission) => permission.action === 'deny' && permission.columns?.length! > 0,
        );

        return _.map(
            filteredPermissions,
            (permission) =>
                ({
                    ...permission,
                    type: 'columns',
                } as PreparedAclSubjectColumn),
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
    _.map(names, (name) => ({key: name, value: name, title: name})),
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
