import { IWorkItemRepository } from '../../domain/repositories/IWorkItemRepository';
import { WorkItem } from '../../domain/entities/WorkItem';

export class GetWorkItemsUseCase {
  constructor(private readonly workItemRepository: IWorkItemRepository) {}

  async execute(queryId: string): Promise<WorkItem[]> {
    return this.workItemRepository.getWorkItemsByQuery(queryId);
  }
}
