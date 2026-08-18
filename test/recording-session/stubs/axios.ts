export const apiCalls: { method: string; url: string }[] = [];

// The shape the chunk endpoint really answers with. The uploader refuses to treat
// anything else as delivery, so a bare {} here would look exactly like a captive portal.
const CHUNK_ACCEPTED = { status: "processed", segments: [], timings: {} };

const record = async (method: string, url: string) => {
    apiCalls.push({ method, url });
    return { data: url.includes("/conversation/chunk") ? CHUNK_ACCEPTED : {} };
};

const api = {
    get:    (url: string) => record("get", url),
    post:   (url: string) => record("post", url),
    put:    (url: string) => record("put", url),
    delete: (url: string) => record("delete", url),
};

export default api;
