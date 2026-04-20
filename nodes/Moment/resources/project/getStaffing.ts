import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import { momentApiRequest } from '../../shared/transport';

export async function getProjectsStaffing(
	this: IExecuteFunctions,
	_itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	return (await momentApiRequest.call(this, 'GET', '/projects/staffing')) as
		| IDataObject
		| IDataObject[];
}