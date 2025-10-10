import React from 'react';
import cn from 'bem-cn-lite';
import {Box, Breadcrumbs, BreadcrumbsProps} from '@gravity-ui/uikit';

import {EditableAsText, EditableAsTextProps} from '../EditableAsText/EditableAsText';

import './EditableBreadcrumbs.scss';

const block = cn('editable-breadcrumbs');

interface Props extends BreadcrumbsProps, Omit<EditableAsTextProps, 'onChange'> {
    view?: 'top-row';
    onChange?: (value?: string) => void;
    children: React.ReactNode;
    beforeEditorContent?: React.ReactNode;
    afterEditorContent?: React.ReactNode;
}

export function EditableBreadcrumbs(props: Props) {
    const {
        className,
        text,
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
        view,
        ...breadcrumbsProps
    } = props;

    return (
        <EditableAsText
            className={block(null, className)}
            text={text}
            onChange={() => {}}
            disableEdit={disableEdit}
            withControls={withControls}
            cancelOnClose={cancelOnClose}
            openOnClick={openOnClick}
            size={size}
            saveButtonView={saveButtonView}
            cancelButtonView={cancelButtonView}
            renderEditor={renderEditor}
            onModeChange={onModeChange}
            renderContent={(contentProps) => (
                <Box
                    style={{flexGrow: 1, flexShrink: 1}}
                    className={block({view: view}, contentProps.className)}
                >
                    <Breadcrumbs
                        {...breadcrumbsProps}
                        showRoot
                        endContent={
                            <>
                                {beforeEditorContent}
                                {contentProps.renderEditButton()}
                                {afterEditorContent}
                            </>
                        }
                    >
                        {children}
                    </Breadcrumbs>
                </Box>
            )}
        >
            <></>
        </EditableAsText>
    );
}
