import React, {FC, useEffect, useMemo, useState} from 'react';
import {Item, SelectSingle} from '../../../../components/Select/Select';
import {Button, TextInput} from '@gravity-ui/uikit';
import {getVcsTokensAvailability, saveToken} from '../../module/vcs/actions';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import './AddTokenForm.scss';
import {selectVcsConfig} from '../../module/vcs/selectors';

const block = cn('add-token-form');

export const AddTokenForm: FC = () => {
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
