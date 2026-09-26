import { build } from 'esbuild';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../..');
const here = import.meta.dirname;
const stubs = {
    '@/lib/axios': 'axios.ts',
    '@tanstack/react-router': 'router.tsx',
    '@/hooks/use-start-consultation': 'start.ts',
    '@/components/consultation/consultation-detail': 'detail.tsx',
};
await build({ entryPoints:[path.join(here,'run.ts')], bundle:true, platform:'node', format:'cjs', jsx:'automatic',
    outfile:path.join(here,'build/run.cjs'), alias:{'@':path.join(root,'src')}, external:['jsdom'],
    define:{'process.env.NODE_ENV':JSON.stringify('development')},
    plugins:[{name:'case-stubs',setup(builder) { builder.onResolve({filter:/.*/}, args => stubs[args.path] ? {path:path.join(here,'stubs',stubs[args.path])} : null); }}],logLevel:'error' });
