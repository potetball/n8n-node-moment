import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MomentApi implements ICredentialType {
	name = 'momentApi';

	displayName = 'Moment API';

	icon: Icon = { light: 'file:../icons/moment.svg', dark: 'file:../icons/moment.dark.svg' };

	documentationUrl = 'https://app.moment.team/api/1.0/';

	properties: INodeProperties[] = [
		{
			displayName: 'Company',
			name: 'company',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'acme',
			description: 'The company identifier used in the Moment API base URL',
		},
		{
			displayName: 'Authorization Header',
			name: 'authorizationHeader',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			placeholder: 'Basic base64(username:password) or Bearer <token>',
			description:
				'The full value sent as the Authorization header. Use either Basic authentication or your API token format.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.authorizationHeader}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '=https://app.moment.team/api/1.0/companies/{{$credentials.company}}',
			url: '/customers',
			method: 'GET',
			qs: {
				size: 1,
				page: 1,
			},
		},
	};
}