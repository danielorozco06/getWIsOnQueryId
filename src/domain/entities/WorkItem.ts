export class WorkItem {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly state: string,
    public readonly type: string,
    public readonly assignedTo?: string,
    public readonly createdDate?: Date
  ) {}
}
