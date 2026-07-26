import {ObjectPermissionRowWithExpand} from '../../utils/acl/acl-aggregate';
import {type PreparedApprover} from '../../store/selectors/acl/acl';

export type ApproverRow = PreparedApprover & {
    aggregated_row_access_predicates?: Array<string>;
    expanded?: boolean;
};
export type PermissionsRow = ObjectPermissionRowWithExpand & {
    aggregated_row_access_predicates?: Array<string>;
    expanded?: boolean;
};
