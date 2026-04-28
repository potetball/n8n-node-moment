import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

function isPagedResponse(response: unknown): response is IDataObject & { content: IDataObject[] } {
	return (
		typeof response === 'object' &&
		response !== null &&
		'content' in response &&
		Array.isArray((response as { content?: unknown }).content)
	);
}

export async function momentApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject | IDataObject[] | string> {
	const credentials = await this.getCredentials('momentApi');
	const company = credentials.company;

	if (typeof company !== 'string' || company.trim() === '') {
		throw new Error('Moment credentials are missing the company value');
	}

	const options: IHttpRequestOptions = {
		method,
		url: `https://app.moment.team/api/1.0/companies/${encodeURIComponent(company)}/${resource.replace(
			/^\//,
			'',
		)}`,
		json: true,
	};

	if (body !== undefined) {
		options.body = body;
	}

	if (qs !== undefined && Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	return await this.helpers.httpRequestWithAuthentication.call(this, 'momentApi', options);
}

export async function momentApiRequestAllItems(
	this: IExecuteFunctions,
	resource: string,
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	const pageSize = 100;
	let page = 1;

	while (true) {
		const response = await momentApiRequest.call(this, 'GET', resource, undefined, {
			...qs,
			page,
			size: pageSize,
		});

		if (Array.isArray(response)) {
			returnData.push(...response);
			break;
		}

		if (!isPagedResponse(response)) {
			if (typeof response === 'object') {
				returnData.push(response);
			}

			break;
		}

		returnData.push(...response.content);

		const pageData = response.page as IDataObject | undefined;
		const totalElements = pageData?.totalElements as number | undefined;

		if (response.content.length < pageSize) {
			break;
		}

		if (totalElements !== undefined && returnData.length >= totalElements) {
			break;
		}

		page += 1;
	}

	return returnData;
}