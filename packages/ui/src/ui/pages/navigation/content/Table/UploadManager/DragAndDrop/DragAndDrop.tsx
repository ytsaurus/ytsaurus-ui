import React from 'react'
import { FileFormats, ProgressState } from './types'
import cn from 'bem-cn-lite';
import { CloudArrowUpIn } from '@gravity-ui/icons';
import FilePicker from '../../../../../../components/FilePicker/FilePicker';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import ErrorBlock from '../../../../../../components/Block/Block';
import './styles/DragAndDrop.scss'
import { Flex } from '@gravity-ui/uikit';
import { ArrowUp } from '@gravity-ui/icons';

type Props<Formats extends FileFormats> = {
	file: File | null
	availableFormats: Formats[]
	progress: ProgressState
	error: Error | null | undefined
	onFileChange: (file: File | null, name: string, fileType: Formats | null) => void
	onError: (error: string | null) => void
	renderFileContent: (file: File) => JSX.Element
}

const block = cn('drag-and-drop');

export const DragAndDrop = <Formats extends FileFormats>({ availableFormats, error, progress, file, renderFileContent, onFileChange, onError }: Props<Formats>) => {
	const { hasUpcomingFile, onDrop, onDragEnter, onDragLeave, onDragOver, onFile } = useDragAndDrop({ availableFormats, progress, onFileChange, onError })

	return (
		<Flex direction={'column'} gap={6}>
			<div
				className={block('drag-area', {
					dropable: hasUpcomingFile,
					empty: !file,
				})}
				onDrop={onDrop}
				onDragEnter={onDragEnter}
				onDragLeave={onDragLeave}
				onDragOver={onDragOver}
			>
				{file ? (
					renderFileContent(file)
				) : (
					<div className={block("center")}>
						<div className={block('uploading-icon', {
							visible: hasUpcomingFile
						})}>
							<ArrowUp />
						</div>
						<CloudArrowUpIn />
						<div className='text'>Drag a file here or
							<FilePicker onChange={onFile}>Pick a file</FilePicker>
						</div>
						<span className='fileFormats'>Available formats: {availableFormats.join(', ')}</span>
					</div>
				)}
			</div>
			{!!error && <ErrorBlock error={error} message={'The file upload has failed'} />}
		</Flex>
	);
}