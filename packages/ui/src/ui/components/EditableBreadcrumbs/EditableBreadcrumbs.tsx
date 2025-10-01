import React from 'react';
import cn from 'bem-cn-lite';
import {BreadcrumbsProps, Box, Breadcrumbs} from '@gravity-ui/uikit';

import {EditableAsText} from '../EditableAsText/EditableAsText';

import './EditableBreadcrumbs.scss';

const block = cn('editable-breadcrumbs');

interface Props extends BreadcrumbsProps {
    className?: string;
    editorClassName?: string;
    
    text?: string;
    onChange?: (value?: string) => void;
    
    disableEdit?: boolean;
    withControls?: boolean;
    cancelOnClose?: boolean;
    openOnClick?: boolean;
    size?: 's' | 'm' | 'l' | 'xl';
    saveButtonView?: 'normal' | 'action' | 'outlined' | 'raised' | 'flat' | 'flat-secondary' | 'flat-info' | 'flat-success' | 'flat-warning' | 'flat-danger' | 'flat-utility';
    cancelButtonView?: 'normal' | 'action' | 'outlined' | 'raised' | 'flat' | 'flat-secondary' | 'flat-info' | 'flat-success' | 'flat-warning' | 'flat-danger' | 'flat-utility';
    
    renderEditor?: (props: {
        value?: string;
        onBlur: () => void;
        onChange: (value?: string) => void;
        className?: string;
        onApply: (value?: string) => void;
    }) => React.ReactNode;
    onModeChange?: (isEdit: boolean) => void;
    
    children: React.ReactNode;
    beforeEditorContent?: React.ReactNode;
    afterEditorContent?: React.ReactNode;
}

export function EditableBreadcrumbs(props: Props) {
    const {
        className,
        editorClassName,
        text,
        onChange,
        disableEdit,
        withControls,
        cancelOnClose,
        openOnClick,
        size,
        saveButtonView,
        cancelButtonView,
        renderEditor,
        onModeChange,
        children,
        beforeEditorContent,
        afterEditorContent,
        ...breadcrumbsProps
    } = props;

    return (
        <EditableAsText
            className={block(null, className)}
            editorClassName={editorClassName}
            text={text}
            onChange={onChange ?? (() => {})}
            disableEdit={disableEdit}
            withControls={withControls}
            cancelOnClose={cancelOnClose}
            openOnClick={openOnClick}
            size={size}
            saveButtonView={saveButtonView}
            cancelButtonView={cancelButtonView}
            renderEditor={renderEditor}
            onModeChange={onModeChange}
            renderContent={
                (contentProps) => 
                    <Box style={{width: '100%'}} className={contentProps.className}>
                        <Breadcrumbs {...breadcrumbsProps} endContent={<div style={{marginLeft: '8px'}}>{beforeEditorContent}{contentProps.renderEditButton()}{afterEditorContent}</div>}>
                            {children}
                        </Breadcrumbs>
                    </Box>
            }
            children={<></>}
        />
    );
}
