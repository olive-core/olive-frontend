export const writes: { url: string; payload: Record<string, any> }[] = [];
export let failWrites = false;
export function setFailWrites(value: boolean) { failWrites = value; }
export default {
  get: async (url: string) => ({ data: responses.get(url) ?? {} }),
  delete: async (url: string) => { writes.push({ url, payload: {} }); return { data: {} }; },
  put: async (url: string, payload: Record<string, any>) => {
    if (failWrites) throw new Error('Offline');
    writes.push({ url, payload });
    return { data: payload };
  },
};

export const responses = new Map<string, unknown>();
