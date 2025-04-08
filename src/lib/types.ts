import { z } from "astro:schema";

const CommitSchema = z.object({
  author: z.string(),
  version: z.string(),
  timestamp: z.string(),
  note: z.string(),
});

const VersionMapSchema = z.record(z.string(), z.string());

const MetadataSchema = z.object({
  assetName: z.string(),
  assetStructureVersion: z.string(),
  keywords: z.string().array(),
  hasTexture: z.boolean(),
  commit: CommitSchema,
  versionMap: VersionMapSchema,
});

type Commit = z.infer<typeof CommitSchema>;
type VersionMap = z.infer<typeof VersionMapSchema>;
type Metadata = z.infer<typeof MetadataSchema>;

export { MetadataSchema, type Commit, type Metadata, type VersionMap };
