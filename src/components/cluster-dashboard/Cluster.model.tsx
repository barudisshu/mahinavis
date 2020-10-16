export interface ClusterMember {
  node: string;
  nodeUid: string;
  roles: string[];
  status: string;
}

export class Cluster {
  public leader: string;
  public members: ClusterMember[];
  public oldest: string;
  public selfNode: string;
  public unreachable: string[];

  constructor(
    leader?: string,
    members?: ClusterMember[],
    oldest?: string,
    selfNode?: string,
    unreachable?: string[]
  ) {
    this.leader = leader || "";
    this.members = members || [];
    this.oldest = oldest || "";
    this.selfNode = selfNode || "";
    this.unreachable = unreachable || [];
  }
}