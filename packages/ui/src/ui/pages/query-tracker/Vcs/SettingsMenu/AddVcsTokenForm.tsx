import React, {FC, useEffect, useMemo, useState} from 'react';
import {Item, SelectSingle} from '../../../../components/Select/Select';
import {Button, TextInput} from '@gravity-ui/uikit';
import {getVcsTokensAvailability, saveToken} from '../../../../store/actions/query-tracker/vcs';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import cn from 'bem-cn-lite';
import './AddVcsTokenForm.scss';
import {selectVcsConfig} from '../../../../store/selectors/query-tracker/vcs';

const block = cn('add-token-form');

export const AddVcsTokenForm: FC = () => {
    const dispatch = useDispatch();
    const [isSaving, setSaving] = useState(false);
    const [vcs, setVcs] = useState<string | undefined>();
    const [token, setToken] = useState('');
    const config = useSelector(selectVcsConfig);

    useEffect(() => {
        dispatch(getVcsTokensAvailability());
    }, [dispatch]);

    const handleSave = async () => {
        if (vcs && token) {
            try {
                setSaving(true);
                await dispatch(saveToken(vcs, token));
            } finally {
                setSaving(false);
                setVcs(undefined);
                setToken('');
            }
        }
    };

    const items = useMemo(() => {
        return config.reduce<Item[]>((acc, item) => {
            if (item.auth === 'none') return acc;

            const {id, name} = item;
            acc.push({value: id, text: name});
            return acc;
        }, []);
    }, [config]);

    return (
        <div className={block()}>
            <SelectSingle items={items} value={vcs} onChange={setVcs} hasClear placeholder="VCS" />
            <TextInput placeholder="token" value={token} onUpdate={setToken} hasClear />
            <Button view="action" onClick={handleSave} loading={isSaving}>
                Save
            </Button>
        </div>
    );
};
