// Isso aqui é só a base, pode ignorar completamente.
// Veja os outros erros para ver como usar.

export abstract class ApiError extends Error {
    public abstract statusCode: number;
    public override cause?: Error;
  
    constructor(message: string, options?: { cause?: Error }) {
      super(message);
      this.name = this.constructor.name;
      this.cause = options?.cause;
    }
  
    toResponse() {
      return {
        error: this.name,
        message: this.message,
        ...(this.cause ? { cause: this.cause.message } : {}),
      };
    }
  }