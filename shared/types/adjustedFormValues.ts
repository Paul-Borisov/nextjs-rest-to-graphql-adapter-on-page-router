import { Repo } from "./repo";

export type AdjustedFormValues = Partial<
  Omit<Repo, "isNewTab"> & {
    isNewTab: boolean;
  }
>;
