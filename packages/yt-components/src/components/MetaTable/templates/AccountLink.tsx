import {hammer} from '../../../utils';
import {ClipboardButton} from '../../ClipboardButton';
import {Tooltip} from '../../Tooltip';
import {Link} from '@gravity-ui/uikit';
import {AccountsTab, Page} from '../../../constants';

interface Props {
    className?: string;
    account?: string;
    cluster?: string;

    inline?: boolean;
}

export default function AccountLink(props: Props) {
    const {cluster, account, className, inline} = props;

    if (!cluster) return null;

    return (
        <Tooltip
            ellipsis={inline}
            className={className}
            content={
                !account ? null : (
                    <>
                        <ClipboardButton text={account} view="flat-secondary" /> {account}
                    </>
                )
            }
        >
            {account ? (
                <Link
                    view={'primary'}
                    href={`/${cluster}/${Page.ACCOUNTS}/${AccountsTab.GENERAL}?account=${account}`}
                >
                    {account}
                </Link>
            ) : (
                hammer.format.NO_VALUE
            )}
        </Tooltip>
    );
}
