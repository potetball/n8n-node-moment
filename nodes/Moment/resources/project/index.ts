import type { INodeProperties } from 'n8n-workflow';

import { createProject, projectCreateDescription } from './create';
import { deleteProject, projectDeleteDescription } from './delete';
import { getProject, projectGetDescription } from './get';
import { getProjects, projectGetAllDescription } from './getAll';
import { getProjectBudget, projectGetBudgetDescription } from './getBudget';
import { getProjectBudgetExpenses, projectGetBudgetExpensesDescription } from './getBudgetExpenses';
import { getProjectBudgetMonthly, projectGetBudgetMonthlyDescription } from './getBudgetMonthly';
import { getProjectsBudgetMonthly } from './getBudgetMonthlyAll';
import { getProjectsBudgetOverview } from './getBudgetOverview';
import { getProjectCompetency, projectGetCompetencyDescription } from './getCompetency';
import { getProjectKeyNumbers, projectGetKeyNumbersDescription } from './getKeyNumbers';
import { getProjectNotes, projectGetNotesDescription } from './getNotes';
import { getProjectPlanBudget, projectGetPlanBudgetDescription } from './getProjectPlanBudget';
import { getProjectStatuses } from './getProjectStatuses';
import { getProjectSelfJoin, projectGetSelfJoinDescription } from './getSelfJoin';
import { getProjectsStaffing } from './getStaffing';
import { getProjectTeam, projectGetTeamDescription } from './getTeam';
import { projectSetCreatedDateToNowDescription, setProjectCreatedDateToNow } from './setCreatedDateToNow';
import { projectUpdateDescription, updateProject } from './update';
import { projectUpdateSelfJoinDescription, updateProjectSelfJoin } from './updateSelfJoin';

const showOnlyForProjects = {
	resource: ['project'],
};

export const projectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProjects,
		},
		options: [
			{ name: 'Get', value: 'get', action: 'Get a project', description: 'Get a single project by ID' },
			{ name: 'List', value: 'list', action: 'List projects', description: 'List project records' },
			{ name: 'Create', value: 'create', action: 'Create a project', description: 'Create a project record' },
			{ name: 'Update', value: 'update', action: 'Update a project', description: 'Update a project record' },
			{ name: 'Delete', value: 'delete', action: 'Delete a project', description: 'Delete a project by ID' },
			{ name: 'Get Budget', value: 'getBudget', action: 'Get a project budget', description: 'Get project budget details' },
			{ name: 'Get Budget Expenses', value: 'getBudgetExpenses', action: 'Get project budget expenses', description: 'Get project budget expenses details' },
			{ name: 'Get Budget Monthly', value: 'getBudgetMonthly', action: 'Get a project monthly budget', description: 'Get project monthly budget details' },
			{ name: 'Get Budget Monthly All', value: 'getBudgetMonthlyAll', action: 'Get monthly budgets for all projects', description: 'Get monthly budget overview for all projects' },
			{ name: 'Get Budget Overview', value: 'getBudgetOverview', action: 'Get projects budget overview', description: 'Get budget overview across projects' },
			{ name: 'Get Competency', value: 'getCompetency', action: 'Get project competency', description: 'Get project team competency data' },
			{ name: 'Get Key Numbers', value: 'getKeyNumbers', action: 'Get project key numbers', description: 'Get project key number metrics' },
			{ name: 'Get Notes', value: 'getNotes', action: 'Get project notes', description: 'Get notes for a project' },
			{ name: 'Get Plan Budget', value: 'getPlanBudget', action: 'Get project plan budget', description: 'Get project plan budget data' },
			{ name: 'Get Project Statuses', value: 'getProjectStatuses', action: 'Get project statuses', description: 'List available project statuses' },
			{ name: 'Get Self Join', value: 'getSelfJoin', action: 'Get self join setting', description: 'Get self join setting for a project' },
			{ name: 'Get Staffing', value: 'getStaffing', action: 'Get projects staffing', description: 'Get staffing across projects' },
			{ name: 'Get Team', value: 'getTeam', action: 'Get project team', description: 'Get team members for a project' },
			{ name: 'Set Created Date To Now', value: 'setCreatedDateToNow', action: 'Set project created date to now', description: 'Update the project created date to the current time' },
			{ name: 'Update Self Join', value: 'updateSelfJoin', action: 'Update self join setting', description: 'Update self join setting for a project' },
		],
		default: 'get',
	},
	...projectGetDescription,
	...projectGetAllDescription,
	...projectCreateDescription,
	...projectUpdateDescription,
	...projectDeleteDescription,
	...projectGetBudgetDescription,
	...projectGetBudgetExpensesDescription,
	...projectGetBudgetMonthlyDescription,
	...projectGetCompetencyDescription,
	...projectGetKeyNumbersDescription,
	...projectGetNotesDescription,
	...projectGetPlanBudgetDescription,
	...projectGetSelfJoinDescription,
	...projectGetTeamDescription,
	...projectSetCreatedDateToNowDescription,
	...projectUpdateSelfJoinDescription,
];

export const projectOperations = {
	create: createProject,
	delete: deleteProject,
	get: getProject,
	getBudget: getProjectBudget,
	getBudgetExpenses: getProjectBudgetExpenses,
	getBudgetMonthly: getProjectBudgetMonthly,
	getBudgetMonthlyAll: getProjectsBudgetMonthly,
	getBudgetOverview: getProjectsBudgetOverview,
	getCompetency: getProjectCompetency,
	getKeyNumbers: getProjectKeyNumbers,
	getNotes: getProjectNotes,
	getPlanBudget: getProjectPlanBudget,
	getProjectStatuses: getProjectStatuses,
	getSelfJoin: getProjectSelfJoin,
	getStaffing: getProjectsStaffing,
	getTeam: getProjectTeam,
	list: getProjects,
	setCreatedDateToNow: setProjectCreatedDateToNow,
	update: updateProject,
	updateSelfJoin: updateProjectSelfJoin,
};