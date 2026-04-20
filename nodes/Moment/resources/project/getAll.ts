import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest, momentApiRequestAllItems } from '../../shared/transport';
import {
	buildProjectListQuery,
	buildProjectPath,
	getProjectIncludes,
	projectFiltersProperty,
	projectIncludesProperty,
	showForProjectOperations,
} from './common';

export const projectGetAllDescription: INodeProperties[] = [
	{
		...projectIncludesProperty,
		displayOptions: showForProjectOperations(['list']),
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: showForProjectOperations(['list']),
		description: 'Whether to return all results by requesting every page',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		...projectFiltersProperty,
		displayOptions: showForProjectOperations(['list']),
	},
];

export async function getProjects(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	const includes = getProjectIncludes.call(this, itemIndex);
	const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
	const qs = buildProjectListQuery(filters);
	const path = buildProjectPath('', undefined, includes);
	const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;

	if (returnAll) {
		return await momentApiRequestAllItems.call(this, path, qs);
	}

	const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
	const response = await momentApiRequest.call(this, 'GET', path, undefined, {
		...qs,
		page: 1,
		size: limit,
	});

	if (Array.isArray(response)) {
		return response;
	}

	if (typeof response === 'object' && response !== null && Array.isArray(response.content)) {
		return response.content as IDataObject[];
	}

	return response as IDataObject;
}