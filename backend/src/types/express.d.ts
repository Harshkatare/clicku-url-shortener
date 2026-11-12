declare namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        sid?: string;
      };

      requestId: string;
    }
  }
