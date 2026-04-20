import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';
import {
	getProjectBody,
	getProjectId,
	projectIdProperty,
	projectUpdateBodyProperty,
	showForProjectOperations,
} from './common';

export const projectUpdateDescription: INodeProperties[] = [
	{
		...projectIdProperty,
		displayOptions: showForProjectOperations(['update']),
	},
	{
		...projectUpdateBodyProperty,
		displayOptions: showForProjectOperations(['update']),
	},
];

export async function updateProject(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const projectId = getProjectId.call(this, itemIndex);
	const body = getProjectBody.call(this, itemIndex);

	return (await momentApiRequest.call(this, 'PATCH', `/projects/${projectId}`, body)) as IDataObject;
}