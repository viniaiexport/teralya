export interface ProblemFieldError {
  field: string;
  code: string;
  message: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  request_id: string;
  retryable: boolean;
  instance?: string;
  field_errors?: ProblemFieldError[];
}

export class ApiProblem extends Error {
  constructor(readonly problem: ProblemDetails) {
    super(problem.detail);
    this.name = 'ApiProblem';
  }
}
