interface R2ObjectBody {
  readonly body: ReadableStream;
  readonly httpMetadata?: {
    contentType?: string;
  };
  writeHttpMetadata(headers: Headers): void;
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
}
