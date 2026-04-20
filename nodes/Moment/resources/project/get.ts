import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';
import {
	buildProjectPath,
	getProjectId,
	getProjectIncludes,
	projectIdProperty,
	projectIncludesProperty,
	showForProjectOperations,
} from './common';

export const projectGetDescription: INodeProperties[] = [
	{
		...projectIdProperty,
		displayOptions: showForProjectOperations(['get']),
	},
	{
		...projectIncludesProperty,
		displayOptions: showForProjectOperations(['get']),
	},
];

export async function getProject(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const projectId = getProjectId.call(this, itemIndex);
	const includes = getProjectIncludes.call(this, itemIndex);

	return (await momentApiRequest.call(
		this,
		'GET',
		buildProjectPath('', projectId, includes),
	)) as IDataObject;
}