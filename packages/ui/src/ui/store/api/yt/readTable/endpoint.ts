import {type YTApiIdType} from '../../../../../shared/constants/yt-api-id';
import {type ReadTableParameters} from '../../../../../shared/yt-types';
import {readStaticTable} from '../../../actions/navigation/content/table/readStaticTable';
import {type YTEndpointApiArgs} from '../types';

export type ReadTableArgs = YTEndpointApiArgs<ReadTableParameters> & {
    id: YTApiIdType;
    reverseRows?: boolean;
};

export async function readTable(args: ReadTableArgs) {
    try {
        return {data: await readStaticTable(args)};
    } catch (error) {
        return {error};
    }
}
