export const queryKeys = {
  tasks: (params: {
    status?: string;
    priority?: string;
    page: number;
    limit: number;
  }) => ["tasks", params] as const,
};
