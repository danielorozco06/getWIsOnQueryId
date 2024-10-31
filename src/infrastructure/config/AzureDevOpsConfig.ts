export class AzureDevOpsConfig {
  constructor(
    public readonly organization: string,
    public readonly project: string,
    public readonly personalAccessToken: string,
    public readonly apiVersion: string
  ) {}

  public static fromEnv(): AzureDevOpsConfig {
    return new AzureDevOpsConfig(
      process.env.AZURE_DEVOPS_ORG ?? '',
      process.env.AZURE_DEVOPS_PROJECT ?? '',
      process.env.AZURE_DEVOPS_TOKEN ?? '',
      process.env.AZURE_DEVOPS_API_VERSION ?? '7.0'
    );
  }
}
