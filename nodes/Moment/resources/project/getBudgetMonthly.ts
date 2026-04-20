import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';
import { getProjectId, projectIdProperty, showForProjectOperations } from './common';

export const projectGetBudgetMonthlyDescription: INodeProperties[] = [
	{
		...projectIdProperty,
		displayOptions: showForProjectOperations(['getBudgetMonthly']),
	},
];

export async function getProjectBudgetMonthly(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const projectId = getProjectId.call(this, itemIndex);

	return (await momentApiRequest.call(
		this,
		'GET',
		`/projects/${projectId}/budgetMonthly`,
	)) as IDataObject;
}