export class WorkItem {
  constructor(
    public readonly id: number,
    public readonly url: string,
    public readonly title: string,
    public readonly state: string,
    public readonly type: string,
    public readonly equipoImpactado: string,
    public readonly categoria: string,
    public readonly description: string,
    public readonly pipelineLink: string,
    public readonly createdBy: string,
    public readonly createdDate?: Date,
    public readonly assignedTo?: string,
    public readonly tags?: string[],
    public readonly commentCount?: number,
    public readonly comments?: any,
    public readonly cumpleDOR?: boolean
  ) {}
}
