import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { momentApiRequest, momentApiRequestAllItems } from './shared/transport';

type MomentOperation = 'get' | 'list' | 'create' | 'update' | 'delete';
type MomentResource = 'customer' | 'project' | 'task' | 'timeRecord';

interface MomentResourceDefinition {
	value: MomentResource;
	name: string;
	apiPath: string;
	bodyExample: string;
	updateExample: string;
}

const momentResources: MomentResourceDefinition[] = [
	{
		value: 'customer',
		name: 'Customer',
		apiPath: 'customers',
		bodyExample: JSON.stringify(
			{
				name: 'Acme Consulting',
				externalId: 'ACME-123',
				country: 'NO',
			},
			null,
			2,
		),
		updateExample: JSON.stringify(
			{
				name: 'Acme Consulting Updated',
			},
			null,
			2,
		),
	},
	{
		value: 'project',
		name: 'Project',
		apiPath: 'projects',
		bodyExample: JSON.stringify(
			{
				name: 'Website Redesign',
				customerId: 101,
				projectState: 'ACTIVE',
			},
			null,
			2,
		),
		updateExample: JSON.stringify(
			{
				statusComment: 'Updated via n8n',
			},
			null,
			2,
		),
	},
	{
		value: 'task',
		name: 'Task',
		apiPath: 'tasks',
		bodyExample: JSON.stringify(
			{
				name: 'Design review',
				projectId: 202,
				assignedToUserAccountId: 12,
				status: 'OPEN',
			},
			null,
			2,
		),
		updateExample: JSON.stringify(
			{
				status: 'DONE',
			},
			null,
			2,
		),
	},
	{
		value: 'timeRecord',
		name: 'Time Record',
		apiPath: 'timeRecords',
		bodyExample: JSON.stringify(
			{
				projectId: 202,
				userAccountId: 12,
				startedAt: '2025-02-01T09:00:00Z',
				endedAt: '2025-02-01T17:00:00Z',
			},
			null,
			2,
		),
		updateExample: JSON.stringify(
			{
				endedAt: '2025-02-01T18:00:00Z',
			},
			null,
			2,
		),
	},
];

function getDisplayOptions(resource: MomentResource, operations?: MomentOperation[]) {
	return {
		show: {
			resource: [resource],
			...(operations ? { operation: operations } : {}),
		},
	};
}

function buildResourceProperties(resource: MomentResourceDefinition): INodeProperties[] {
	return [
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: getDisplayOptions(resource.value),
			options: [
				{
					name: 'Get',
					value: 'get',
					action: `Get a ${resource.name.toLowerCase()}`,
					description: `Fetch a single ${resource.name.toLowerCase()} by ID`,
				},
				{
					name: 'List',
					value: 'list',
					action: `List ${resource.name.toLowerCase()}s`,
					description: `List ${resource.name.toLowerCase()} records`,
				},
				{
					name: 'Create',
					value: 'create',
					action: `Create a ${resource.name.toLowerCase()}`,
					description: `Create a ${resource.name.toLowerCase()} record`,
				},
				{
					name: 'Update',
					value: 'update',
					action: `Update a ${resource.name.toLowerCase()}`,
					description: `Partially update a ${resource.name.toLowerCase()} record`,
				},
				{
					name: 'Delete',
					value: 'delete',
					action: `Delete a ${resource.name.toLowerCase()}`,
					description: `Delete a ${resource.name.toLowerCase()} record by ID`,
				},
			],
			default: 'get',
		},
		{
			displayName: `${resource.name} ID`,
			name: 'resourceId',
			type: 'string',
			required: true,
			default: '',
			displayOptions: getDisplayOptions(resource.value, ['get', 'update', 'delete']),
			description: `The ID of the ${resource.name.toLowerCase()} to work with`,
		},
		{
			displayName: 'Includes',
			name: 'includes',
			type: 'string',
			default: '',
			displayOptions: getDisplayOptions(resource.value, ['get', 'list']),
			placeholder: 'customer,team',
			description: 'Comma-separated related entities to include using the API include path variant',
		},
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			displayOptions: getDisplayOptions(resource.value, ['list']),
			description: 'Whether to return all results by requesting every page',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			typeOptions: {
				minValue: 1,
			},
			default: 50,
			displayOptions: {
				show: {
					resource: [resource.value],
					operation: ['list'],
					returnAll: [false],
				},
			},
			description: 'Max number of results to return',
		},
		{
			displayName: 'Filters',
			name: 'filters',
			type: 'collection',
			placeholder: 'Add Filter',
			default: {},
			displayOptions: getDisplayOptions(resource.value, ['list']),
			options: [
				{
					displayName: 'Created Date From',
					name: 'createdDateFrom',
					type: 'string',
					default: '',
					description: 'Filter by created date from, for example 2025-02-01T00:00:00Z',
				},
				{
					displayName: 'Created Date To',
					name: 'createdDateTo',
					type: 'string',
					default: '',
					description: 'Filter by created date to, for example 2025-02-28T23:59:59Z',
				},
				{
					displayName: 'ID',
					name: 'id',
					type: 'number',
					default: '',
					description: 'Filter by a specific ID',
				},
				{
					displayName: 'IDs',
					name: 'ids',
					type: 'string',
					default: '',
					placeholder: '101,102,103',
					description: 'Filter by multiple IDs as a comma-separated list',
				},
				{
					displayName: 'Last Modified Date From',
					name: 'lastModifiedDateFrom',
					type: 'string',
					default: '',
					description: 'Filter by last modified date from, for example 2025-02-01T00:00:00Z',
				},
				{
					displayName: 'Last Modified Date To',
					name: 'lastModifiedDateTo',
					type: 'string',
					default: '',
					description: 'Filter by last modified date to, for example 2025-02-28T23:59:59Z',
				},
				{
					displayName: 'Query',
					name: 'query',
					type: 'string',
					default: '',
					description: 'Free-text search query',
				},
				{
					displayName: 'Sort',
					name: 'sort',
					type: 'string',
					default: '',
					placeholder: 'id,asc',
					description: 'Sort field and direction',
				},
			],
		},
		{
			displayName: 'Body',
			name: 'body',
			type: 'json',
			required: true,
			default: resource.bodyExample,
			displayOptions: getDisplayOptions(resource.value, ['create']),
			description: `JSON payload for the ${resource.name.toLowerCase()} create request`,
		},
		{
			displayName: 'Body',
			name: 'body',
			type: 'json',
			required: true,
			default: resource.updateExample,
			displayOptions: getDisplayOptions(resource.value, ['update']),
			description: `JSON payload for the ${resource.name.toLowerCase()} update request`,
		},
	];
}

function cleanStringList(value: string): string {
	return value
		.split(',')
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0)
		.join(',');
}

function buildResourcePath(apiPath: string, includes: string, resourceId?: string): string {
	const normalizedIncludes = cleanStringList(includes);
	const basePath = resourceId ? `/${apiPath}/${resourceId}` : `/${apiPath}`;

	if (normalizedIncludes.length === 0) {
		return basePath;
	}

	return `${basePath}/include/${normalizedIncludes}`;
}

function buildListQuery(filters: IDataObject): IDataObject {
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

async function executeMomentOperation(
	this: IExecuteFunctions,
	itemIndex: number,
	resource: MomentResourceDefinition,
	operation: MomentOperation,
): Promise<IDataObject | IDataObject[]> {
	const includes = this.getNodeParameter('includes', itemIndex, '') as string;

	switch (operation) {
		case 'get': {
			const resourceId = this.getNodeParameter('resourceId', itemIndex) as string;

			return (await momentApiRequest.call(
				this,
				'GET',
				buildResourcePath(resource.apiPath, includes, resourceId),
			)) as IDataObject;
		}

		case 'list': {
			const returnAll = this.getNodeParameter('returnAll', itemIndex, false) as boolean;
			const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
			const qs = buildListQuery(filters);
			const path = buildResourcePath(resource.apiPath, includes);

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

		case 'create': {
			const body = this.getNodeParameter('body', itemIndex) as IDataObject;

			return (await momentApiRequest.call(this, 'POST', `/${resource.apiPath}`, body)) as IDataObject;
		}

		case 'update': {
			const resourceId = this.getNodeParameter('resourceId', itemIndex) as string;
			const body = this.getNodeParameter('body', itemIndex) as IDataObject;

			return (await momentApiRequest.call(
				this,
				'PATCH',
				`/${resource.apiPath}/${resourceId}`,
				body,
			)) as IDataObject;
		}

		case 'delete': {
			const resourceId = this.getNodeParameter('resourceId', itemIndex) as string;
			const response = await momentApiRequest.call(this, 'DELETE', `/${resource.apiPath}/${resourceId}`);

			if (typeof response === 'object' && response !== null) {
				return response as IDataObject;
			}

			return {
				success: true,
				id: resourceId,
			};
		}
	}
}

const resourceOptions = momentResources.map((resource) => ({
	name: resource.name,
	value: resource.value,
}));

export class Moment implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Moment',
		name: 'moment',
		icon: { light: 'file:../../icons/moment.svg', dark: 'file:../../icons/moment.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the Moment API',
		defaults: {
			name: 'Moment',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		requestDefaults: {
			baseURL: '=https://app.moment.team/api/1.0/companies/{{$credentials.company}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		credentials: [
			{
				name: 'momentApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: resourceOptions,
				default: 'customer',
			},
			...momentResources.flatMap((resource) => buildResourceProperties(resource)),
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resourceValue = this.getNodeParameter('resource', itemIndex) as MomentResource;
				const operation = this.getNodeParameter('operation', itemIndex) as MomentOperation;
				const resource = momentResources.find((candidate) => candidate.value === resourceValue);

				if (resource === undefined) {
					throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resourceValue}`, {
						itemIndex,
					});
				}

				const responseData = await executeMomentOperation.call(
					this,
					itemIndex,
					resource,
					operation,
				);

				if (Array.isArray(responseData)) {
					returnData.push(
						...responseData.map((entry) => ({
							json: entry,
							pairedItem: itemIndex,
						})),
					);
					continue;
				}

				returnData.push({
					json: responseData,
					pairedItem: itemIndex,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error',
						},
						pairedItem: itemIndex,
					});
					continue;
				}

				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex,
				});
			}
		}

		return [returnData];
	}
}