import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';

export async function getProjectsBudgetMonthly(
	this: IExecuteFunctions,
	_itemIndex: number,
): Promise<IDataObject> {
	return (await momentApiRequest.call(this, 'GET', '/projects/budgetMonthly')) as IDataObject;
}