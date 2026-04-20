import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';
import { getProjectBody, projectBodyProperty, showForProjectOperations } from './common';

export const projectCreateDescription: INodeProperties[] = [
	{
		...projectBodyProperty,
		displayOptions: showForProjectOperations(['create']),
	},
];

export async function createProject(this: IExecuteFunctions, itemIndex: number): Promise<IDataObject> {
	const body = getProjectBody.call(this, itemIndex);

	return (await momentApiRequest.call(this, 'POST', '/projects', body)) as IDataObject;
}