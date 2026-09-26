export const calls: { method: string; url: string; body?: unknown }[] = [];
export const responses = new Map<string, unknown>();
export let failOpen = false;
export const setFailOpen = (value: boolean) => { failOpen = value; };
const api = {
    get: async (url: string) => { calls.push({method:'get',url}); return {data: responses.get(url)}; },
    post: async (url: string, body?: unknown) => {
        calls.push({method:'post',url,body});
        if (url === '/case/open' && failOpen) throw {response:{data:{detail:'Case code not found. Check the code and try again.'}}};
        return {data: responses.get(url) ?? {root_session_id:'root'}};
    },
};
export default api;
