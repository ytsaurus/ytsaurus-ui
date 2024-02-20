import React, { useState } from 'react';
import format from '../../../../../../../common/hammer/format';
import { getConfigUploadTable } from '../../../../../../../config';
import { FORMATS } from '../constants';
import { FileFormats, ProgressState } from '../types';

interface State {
	name: string;
	hasUpcomingFile: boolean;
	fileType: FileFormats | null;
}



function trimFileExtension(fileName = '') {
	const words = fileName.split('.')
	words.pop()

	return words.join('.')
}

const UPLOAD_CONFIG = getConfigUploadTable();

type Props<Formats extends FileFormats> = {
	availableFormats: Formats[];
	progress: ProgressState;
	onFileChange: (file: File | null, name: string, fileType: Formats | null) => void
	onError: (error: string | null) => void
}

export const useDragAndDrop = <Formats extends FileFormats>({ availableFormats, progress, onFileChange, onError }: Props<Formats>) => {
	const [state, setState] = useState<State>({
		name: '',
		hasUpcomingFile: false,
		fileType: null,
	})

	const { hasUpcomingFile } = state

	const checkFile = (file: File | null): string | null => {
		if (!file) {
			return 'File is not selected';
		}

		const { size, type } = file

		if (size > UPLOAD_CONFIG.uploadTableMaxSize) {
			return `File size must not be greater than ${format.Bytes(
				UPLOAD_CONFIG.uploadTableMaxSize,
			)}`;
		}

		if (!availableFormats.find((format) => FORMATS[format].type === type)) {
			return `Invalid file format. Instead of ${type} it should be ${availableFormats.length > 1 ? `one of these: ${availableFormats}` : availableFormats} `
		}

		return null;
	}


	const onFile = (files: FileList | null) => {
		const file = files && files[0];

		if (file) {
			const fileError = checkFile(file);

			if (fileError) {
				setState({
					...state,
					hasUpcomingFile: false,
				});

				return onError(fileError)
			}

			const name = trimFileExtension(file?.name) || ''

			setState({
				...state,
				hasUpcomingFile: false,
				name,
			});
			const fileType = (Object.keys(FORMATS).find((format) => FORMATS[format as Formats].type === file.type) as Formats) ?? null

			onFileChange(file, name, fileType)
			onError(null)
		}
	};

	const onDragEnter = () => {
		if (!progress.inProgress) {
			setState({ ...state, hasUpcomingFile: true });
		}
	};

	const onDragLeave = () => {
		if (!progress.inProgress) {
			setState({ ...state, hasUpcomingFile: false });
		}
	};

	const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();

		if (progress.inProgress) {
			return;
		}

		if (!hasUpcomingFile) {
			setState({ ...state, hasUpcomingFile: true });
		}
	};

	const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();

		if (progress.inProgress) {
			return;
		}

		const { files } = event.dataTransfer;
		if (!files) {
			return;
		}

		onFile(files);
	};

	return { hasUpcomingFile, onDrop, onDragEnter, onDragLeave, onDragOver, onFile }
}
