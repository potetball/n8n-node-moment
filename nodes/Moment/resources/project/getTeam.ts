import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';
import { getProjectId, projectIdProperty, showForProjectOperations } from './common';

export const projectGetTeamDescription: INodeProperties[] = [
	{
		...projectIdProperty,
		displayOptions: showForProjectOperations(['getTeam']),
	},
];

export async function getProjectTeam(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const projectId = getProjectId.call(this, itemIndex);

	return (await momentApiRequest.call(this, 'GET', `/projects/${projectId}/team`)) as
		| IDataObject
		| IDataObject[];
}