import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import {
    Link,
    Outlet,
    createRootRouteWithContext,
    HeadContent,
    Scripts,
} from '@tanstack/react-router';

type RouterContext = {
    head: string;
};

export const Route = createRootRouteWithContext<RouterContext>()({
    head: () => ({
        meta: [
            {
                title: 'TanStack Router SSR Basic File Based',
            },
            {
                charSet: 'UTF-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1.0',
            },
        ],
        scripts: [
            {
                src: 'https://unpkg.com/@tailwindcss/browser@4',
            },
            {
                type: 'module',
                children: `import RefreshRuntime from "/@react-refresh"
  RefreshRuntime.injectIntoGlobalHook(window)
  window.$RefreshReg$ = () => {}
  window.$RefreshSig$ = () => (type) => type
  window.__vite_plugin_react_preamble_installed__ = true`,
            },
            {
                type: 'module',
                src: '/@vite/client',
            },
            {
                type: 'module',
                src: '/src/entry-client.tsx',
            },
        ],
    }),
    component: RootComponent,
});

function RootComponent() {
    return (
        <html lang='en'>
            <head>
                <HeadContent />
            </head>
            <body className='bg-slate-800 text-white p-2'>
                <div className='p-2 flex gap-4 text-lg'>
                    <Link
                        to='/'
                        className='text-blue-500 font-bold'
                    >
                        Home
                    </Link>

                    <Link
                        to='/error'
                        className='text-red-500 font-bold'
                    >
                        Error
                    </Link>
                </div>
                <hr />
                <Outlet />
                <TanStackRouterDevtools position='bottom-right' />
                <Scripts />
            </body>
        </html>
    );
}
