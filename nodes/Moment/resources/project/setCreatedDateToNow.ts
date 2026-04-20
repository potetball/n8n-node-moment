import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';
import { getProjectId, projectIdProperty, showForProjectOperations } from './common';

export const projectSetCreatedDateToNowDescription: INodeProperties[] = [
	{
		...projectIdProperty,
		displayOptions: showForProjectOperations(['setCreatedDateToNow']),
	},
];

export async function setProjectCreatedDateToNow(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const projectId = getProjectId.call(this, itemIndex);

	return (await momentApiRequest.call(this, 'POST', '/projects/setCreatedDateToNow', {
		id: projectId,
	})) as IDataObject;
}