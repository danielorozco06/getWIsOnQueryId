import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { WorkItem } from '../../domain/entities/WorkItem';
import { IWorkItemRepository } from '../../domain/repositories/IWorkItemRepository';
import { AzureDevOpsConfig } from '../config/AzureDevOpsConfig';

export class AzureDevOpsWorkItemRepository implements IWorkItemRepository {
  private readonly connection: WebApi;

  constructor(private readonly config: AzureDevOpsConfig) {
    const authHandler = getPersonalAccessTokenHandler(config.personalAccessToken);
    this.connection = new WebApi(`https://dev.azure.com/${config.organization}`, authHandler);
  }

  async getWorkItemsByQuery(queryId: string): Promise<WorkItem[]> {
    const workItemTrackingApi = await this.connection.getWorkItemTrackingApi();
    // Execute the query
    const queryResult = await workItemTrackingApi.queryById(queryId, { project: this.config.project });

    if (!queryResult.workItems || queryResult.workItems.length === 0) {
      return [];
    }

    // Get detailed work items
    const ids = queryResult.workItems.map(wi => wi.id ?? 0);
    const workItems = await workItemTrackingApi.getWorkItems(ids);

    return workItems.map(
      wi =>
        new WorkItem(
          wi.id ?? 0,
          // WI edit url
          `https://dev.azure.com/${this.config.organization}/${this.config.project}/_workitems/edit/${wi.id}`,
          wi.fields?.['System.Title'] ?? '',
          wi.fields?.['System.State'] ?? '',
          wi.fields?.['System.WorkItemType'] ?? '',
          wi.fields?.['Custom.EquipoImpactado'] ?? '',
          // Category
          wi.fields?.['Custom.832ceda1-ab52-4a64-8f7b-2b4aef222efc'] ?? '',
          wi.fields?.['System.Description'] ?? '',
          // Pipeline link
          wi.fields?.['Custom.Link'] ?? '',
          wi.fields?.['System.CreatedBy']?.displayName ?? '',
          new Date(wi.fields?.['System.CreatedDate'] ?? ''),
          wi.fields?.['System.AssignedTo']?.displayName ?? '',
          wi.fields?.['System.Tags']?.split(';') ?? []
        )
    );
  }
}
