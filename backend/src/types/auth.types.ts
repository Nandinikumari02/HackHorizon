export interface JwtPayload {
  userId: string;
  role: "CITIZEN" | "STAFF" | "DEPARTMENT_ADMIN";
  departmentId?: string | null;
}
