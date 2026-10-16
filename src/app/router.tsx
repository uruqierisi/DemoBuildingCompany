import { createBrowserRouter, type RouteObject } from 'react-router';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';
import { RootLayout } from './RootLayout';
import { apartmentLoader, buildingLoader } from './route-loaders';
import type { RouteHandle } from './route-handle';

const homeHandle: RouteHandle = { overlaysHero: true };

/**
 * Dev-only tools. `import.meta.env.DEV` is false in production builds, so this array is empty and
 * the editor chunk is never emitted.
 */
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/editor',
        errorElement: <RouteErrorPage />,
        // Shown while the lazy chunk loads when /editor is opened directly.
        hydrateFallbackElement: <div className="min-h-svh bg-paper" />,
        lazy: async () => ({ Component: (await import('@/features/editor/EditorPage')).EditorPage }),
      },
    ]
  : [];

/**
 * Pitch-only tools, built only while VITE_DEMO_MODE is on (__DEMO_MODE__ is a build-time constant,
 * so with the flag off this array is empty and the admin chunk is never emitted). Not linked anywhere.
 */
const demoRoutes: RouteObject[] = __DEMO_MODE__
  ? [
      {
        path: '/demo-admin',
        errorElement: <RouteErrorPage />,
        hydrateFallbackElement: <div className="min-h-svh bg-paper" />,
        lazy: async () => ({ Component: (await import('@/features/demo-admin/DemoAdminPage')).DemoAdminPage }),
      },
    ]
  : [];

export const router = createBrowserRouter([
  ...devRoutes,
  ...demoRoutes,
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        // Errors thrown by a page render inside the layout, keeping header and footer.
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <HomePage />, handle: homeHandle },
          {
            path: 'objekti/:buildingId',
            loader: buildingLoader,
            // Keeps the layout on screen while the page chunk loads on a direct visit.
            hydrateFallbackElement: <div className="min-h-svh" />,
            lazy: async () => ({ Component: (await import('@/pages/BuildingPage')).BuildingPage }),
          },
          {
            path: 'objekti/:buildingId/:apartmentId',
            loader: apartmentLoader,
            hydrateFallbackElement: <div className="min-h-svh" />,
            lazy: async () => ({ Component: (await import('@/pages/ApartmentPage')).ApartmentPage }),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
