import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { CommentList } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import fs from 'fs';
import { WorkItem } from '../../domain/entities/WorkItem';
import { IWorkItemRepository } from '../../domain/repositories/IWorkItemRepository';
import { AzureDevOpsConfig } from '../config/AzureDevOpsConfig';
import { CategoryDOR, Dors } from './interfaces';

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

    // Get categories
    const dors: Dors = await this.getJsonFileContent('./src/infrastructure/constants/categoriesDOR.json');

    const mappedWorkItems = await Promise.all(
      workItems.map(async wi => {
        const wiUrl = `https://dev.azure.com/${this.config.organization}/${this.config.project}/_workitems/edit/${wi.id}`;
        const category = wi.fields?.['Custom.832ceda1-ab52-4a64-8f7b-2b4aef222efc'] ?? '';
        const commentCount = wi.fields?.['System.CommentCount'] ?? 0;
        const comments = commentCount > 0 ? await this.getComments(wi.id ?? 0) : [];
        const description = this.stripHtml(wi.fields?.['System.Description'] ?? '');
        const { cumpleDOR, fields } = this.checkDor(dors.categories, description, category);

        return new WorkItem(
          wi.id ?? 0,
          wiUrl,
          cumpleDOR,
          fields,
          wi.fields?.['System.Title'] ?? '',
          wi.fields?.['System.State'] ?? '',
          wi.fields?.['System.WorkItemType'] ?? '',
          wi.fields?.['Custom.EquipoImpactado'] ?? '',
          category,
          wi.fields?.['System.CreatedBy']?.displayName ?? '',
          new Date(wi.fields?.['System.CreatedDate'] ?? ''),
          wi.fields?.['System.AssignedTo']?.displayName ?? '',
          wi.fields?.['System.Tags']?.split(';') ?? [],
          commentCount
        );
      })
    );

    // Sort by CreatedDate in ascending order
    return mappedWorkItems.sort((a, b) => {
      const aTime = a.createdDate?.getTime() ?? 0;
      const bTime = b.createdDate?.getTime() ?? 0;
      return aTime - bTime;
    });
  }

  private stripHtml(html: string): string {
    // Remove html entities
    let text = html.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

    // Remove html tags while preserving href content
    text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>/g, '$1');

    // Remove remaining html tags
    text = text.replace(/<[^>]*>?/g, '');

    // Trim whitespace and normalize spaces
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  private async getComments(workItemId: number): Promise<CommentList> {
    const workItemTrackingApi = await this.connection.getWorkItemTrackingApi();
    return workItemTrackingApi.getComments(this.config.project, workItemId);
  }

  private getJsonFileContent(filePath: string): Promise<any> {
    const jsonContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonContent);
  }

  private checkDor(
    categories: CategoryDOR[],
    description: string,
    wiCategory: string
  ): { cumpleDOR: boolean; fields: string[] } {
    const category = categories.find(c => c.name.toLowerCase() === wiCategory.toLowerCase());
    if (!category?.dor?.required_fields) {
      return { cumpleDOR: false, fields: [] };
    }

    // Helper function to remove accents/diacritics from text
    const removeAccents = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Normalize description by converting to lowercase and removing accents
    const normalizedDescription = removeAccents(description.toLowerCase());

    const hasAllFields = category.dor.required_fields.every(field => {
      // Normalize field name by converting to lowercase and removing accents
      const normalizedFieldName = removeAccents(field.name.toLowerCase());
      return normalizedDescription.includes(normalizedFieldName);
    });

    return { cumpleDOR: hasAllFields, fields: category.dor.required_fields.map(field => field.name) };
  }
}
