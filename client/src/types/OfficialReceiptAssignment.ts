export interface OfficialReceiptAssignment {
  ORAssignmentId: number;
  ORFrom: string;
  ORTo: string;
  LastORUsed: string | null;
  UserId: number;
  CreatedAt: string;
}

export interface ActiveOfficialReceiptAssignment {
  ORAssignmentId: number;
  ORFrom: string;
  ORTo: string;
  LastORUsed: string | null;
  RemainingCount: number;
}
