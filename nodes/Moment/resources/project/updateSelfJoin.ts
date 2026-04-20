import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';
import { getProjectBody, getProjectId, projectIdProperty, showForProjectOperations } from './common';

export const projectUpdateSelfJoinDescription: INodeProperties[] = [
	{
		...projectIdProperty,
		displayOptions: showForProjectOperations(['updateSelfJoin']),
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'json',
		required: true,
		default: JSON.stringify(
			{
				allowSelfJoin: true,
			},
			null,
			2,
		),
		displayOptions: showForProjectOperations(['updateSelfJoin']),
		description: 'JSON payload for the project self join update request',
	},
];

export async function updateProjectSelfJoin(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const projectId = getProjectId.call(this, itemIndex);
	const body = getProjectBody.call(this, itemIndex);

	return (await momentApiRequest.call(this, 'PUT', `/projects/${projectId}/selfJoin`, body)) as IDataObject;
}