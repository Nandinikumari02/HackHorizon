/** Legacy superadmin dashboard — not backed by the EcoSarthi waste API; returns empty-safe mock data. */
export const dashboardService = {
  getSuperAdminStats: async () => ({
    globalSummary: {
      totalIssues: 0,
      totalStaff: 0,
    },
    statusBreakdown: [] as { status: string; _count: { id: number } }[],
    departmentComparison: [] as {
      id?: string;
      name: string;
      _count: { issues: number; resolved?: number };
    }[],
  }),
};
