import { createHash } from "crypto";

export const hash = (id: string) => createHash("sha1").update(id).digest("hex");
