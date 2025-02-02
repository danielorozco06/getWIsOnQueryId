import { AzureDevOpsConfig } from './infrastructure/config/AzureDevOpsConfig';
import { AzureDevOpsWorkItemRepository } from './infrastructure/repositories/AzureDevOpsWorkItemRepository';
import { GetWorkItemsUseCase } from './application/useCases/GetWorkItemsUseCase';
import { WorkItemController } from './presentation/controllers/WorkItemController';

async function main() {
  // Load configuration
  const config = AzureDevOpsConfig.fromEnv();

  // Initialize repository
  const repository = new AzureDevOpsWorkItemRepository(config);

  // Initialize use case
  const getWorkItemsUseCase = new GetWorkItemsUseCase(repository);

  // Initialize controller
  const controller = new WorkItemController(getWorkItemsUseCase);

  // Example query ID from your URL
  const queryId = 'ce3a8f0c-6af3-469c-b84b-de23ca950166';

  // Get work items
  const result = await controller.getWorkItems(queryId);

  // Filter work items based on DOR compliance and tags, and print the result
  const filteredWorkItems = result.data?.filter(
    wi => (wi.cumpleDOR && !wi.tags?.includes('CumpleDOR')) || (!wi.cumpleDOR && !wi.tags?.includes('NoCumpleDOR'))
  );
  console.log(JSON.stringify({ ...result, data: filteredWorkItems }, null, 2));
}

main().catch(console.error);
