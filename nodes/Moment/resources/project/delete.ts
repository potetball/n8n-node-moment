import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';
import { getProjectId, projectIdProperty, showForProjectOperations } from './common';

export const projectDeleteDescription: INodeProperties[] = [
	{
		...projectIdProperty,
		displayOptions: showForProjectOperations(['delete']),
	},
];

export async function deleteProject(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const projectId = getProjectId.call(this, itemIndex);
	const response = await momentApiRequest.call(this, 'DELETE', `/projects/${projectId}`);

	if (typeof response === 'object' && response !== null) {
		return response as IDataObject;
	}

	return {
		success: true,
		id: projectId,
	};
}