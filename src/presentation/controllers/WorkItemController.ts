import { GetWorkItemsUseCase } from '../../application/useCases/GetWorkItemsUseCase';

export class WorkItemController {
  constructor(private readonly getWorkItemsUseCase: GetWorkItemsUseCase) {}

  async getWorkItems(queryId: string) {
    try {
      const workItems = await this.getWorkItemsUseCase.execute(queryId);
      return {
        success: true,
        data: workItems
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
