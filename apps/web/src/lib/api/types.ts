export type ApiEnvelope<TData> = {
  data: TData;
};

export type ApiPaginatedEnvelope<TData> = {
  data: TData;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export type ApiErrorEnvelope = {
  statusCode: number;
  error: string;
  message: string | string[] | Record<string, unknown>;
  timestamp: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};
