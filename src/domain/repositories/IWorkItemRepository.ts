import { WorkItem } from '../entities/WorkItem';

export interface IWorkItemRepository {
  getWorkItemsByQuery(queryId: string): Promise<WorkItem[]>;
}
