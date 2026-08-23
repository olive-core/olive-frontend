export const apiCalls: { method: string; url: string }[] = [];

const record = async (method: string, url: string) => {
    apiCalls.push({ method, url });
    return { data: {} };
};

const api = {
    get:    (url: string) => record("get", url),
    post:   (url: string) => record("post", url),
    put:    (url: string) => record("put", url),
    delete: (url: string) => record("delete", url),
};

export default api;
