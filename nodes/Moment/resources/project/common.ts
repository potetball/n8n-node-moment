import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

const showOnlyForProjects = {
	resource: ['project'],
};

export function showForProjectOperations(operations: string[]) {
	return {
		show: {
			...showOnlyForProjects,
			operation: operations,
		},
	};
}

export const projectIdProperty: INodeProperties = {
	displayName: 'Project ID',
	name: 'projectId',
	type: 'string',
	required: true,
	default: '',
	description: 'The ID of the project to work with',
};

export const projectIncludesProperty: INodeProperties = {
	displayName: 'Includes',
	name: 'includes',
	type: 'string',
	default: '',
	placeholder: 'customer,team',
	description: 'Comma-separated related entities to include using the include path variant',
};

export const projectBodyProperty: INodeProperties = {
	displayName: 'Body',
	name: 'body',
	type: 'json',
	required: true,
	default: JSON.stringify(
		{
			name: 'Website Redesign',
			customerId: 101,
			projectState: 'ACTIVE',
		},
		null,
		2,
	),
	description: 'JSON payload for the project request body',
};

export const projectUpdateBodyProperty: INodeProperties = {
	...projectBodyProperty,
	default: JSON.stringify(
		{
			statusComment: 'Updated via n8n',
		},
		null,
		2,
	),
};

export const projectFiltersProperty: INodeProperties = {
	displayName: 'Filters',
	name: 'filters',
	type: 'collection',
	placeholder: 'Add Filter',
	default: {},
	options: [
		{
			displayName: 'Created Date From',
			name: 'createdDateFrom',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Created Date To',
			name: 'createdDateTo',
			type: 'string',
			default: '',
		},
		{
			displayName: 'ID',
			name: 'id',
			type: 'number',
			default: '',
		},
		{
			displayName: 'IDs',
			name: 'ids',
			type: 'string',
			default: '',
			placeholder: '101,102,103',
		},
		{
			displayName: 'Last Modified Date From',
			name: 'lastModifiedDateFrom',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Last Modified Date To',
			name: 'lastModifiedDateTo',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Query',
			name: 'query',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Sort',
			name: 'sort',
			type: 'string',
			default: '',
			placeholder: 'id,asc',
		},
	],
};

export function cleanStringList(value: string): string {
	return value
		.split(',')
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0)
		.join(',');
}

export function buildProjectPath(suffix = '', projectId?: string, includes = ''): string {
	const normalizedIncludes = cleanStringList(includes);
	let path = projectId ? `/projects/${projectId}` : '/projects';

	if (normalizedIncludes.length > 0) {
		path = `${path}/include/${normalizedIncludes}`;
	}

	if (suffix.length > 0) {
		path = `${path}/${suffix}`;
	}

	return path;
}

export function buildProjectListQuery(filters: IDataObject): IDataObject {
	const query: IDataObject = {};

	for (const [key, value] of Object.entries(filters)) {
		if (value === '' || value === undefined || value === null) {
			continue;
		}

		if (key === 'ids' && typeof value === 'string') {
			const ids = value
				.split(',')
				.map((entry) => entry.trim())
				.filter((entry) => entry.length > 0);

			if (ids.length > 0) {
				query[key] = ids;
			}

			continue;
		}

		query[key] = value;
	}

	return query;
}

export function getProjectId(this: IExecuteFunctions, itemIndex: number): string {
	return this.getNodeParameter('projectId', itemIndex) as string;
}

export function getProjectBody(this: IExecuteFunctions, itemIndex: number): IDataObject {
	return this.getNodeParameter('body', itemIndex) as IDataObject;
}

export function getProjectIncludes(this: IExecuteFunctions, itemIndex: number): string {
	return this.getNodeParameter('includes', itemIndex, '') as string;
}