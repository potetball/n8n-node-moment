import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';
import { getProjectId, projectIdProperty, showForProjectOperations } from './common';

export const projectGetNotesDescription: INodeProperties[] = [
	{
		...projectIdProperty,
		displayOptions: showForProjectOperations(['getNotes']),
	},
];

export async function getProjectNotes(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const projectId = getProjectId.call(this, itemIndex);

	return (await momentApiRequest.call(this, 'GET', `/projects/${projectId}/notes`)) as
		| IDataObject
		| IDataObject[];
}