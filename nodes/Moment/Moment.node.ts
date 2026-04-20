import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import { projectDescription, projectOperations } from './resources/project';

type MomentResponse = IDataObject | IDataObject[];
type MomentOperationHandler = (
	this: IExecuteFunctions,
	itemIndex: number,
) => Promise<MomentResponse>;

const momentOperations: Record<string, Record<string, MomentOperationHandler>> = {
	project: projectOperations,
};

export class Moment implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Moment',
		name: 'moment',
		icon: { light: 'file:../../icons/moment.png', dark: 'file:../../icons/moment.png' },
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
				options: [
					{
						name: 'Project',
						value: 'project',
					},
				],
				default: 'project',
			},
			...projectDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const resourceOperations = momentOperations[resource];

				if (resourceOperations === undefined) {
					throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
						itemIndex,
					});
				}

				const operationHandler = resourceOperations[operation];

				if (operationHandler === undefined) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported ${resource} operation: ${operation}`,
						{ itemIndex },
					);
				}

				const responseData = await operationHandler.call(this, itemIndex);

				if (Array.isArray(responseData)) {
					returnData.push({ json: { data: responseData }, pairedItem: itemIndex });
					continue;
				}

				returnData.push({ json: responseData, pairedItem: itemIndex });
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