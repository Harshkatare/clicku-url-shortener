import { AppError } from "./AppError.js";

export class ArchivedUrlError extends AppError {
  public readonly slug: string;

  constructor(slug: string) {
    super("This short link has been archived or deactivated by its owner.", 410);
    this.name = "ArchivedUrlError";
    this.slug = slug;
  }
}
