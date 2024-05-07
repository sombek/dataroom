import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage.tsx';
import CreateFile from './pages/CreateFile/CreateFile.tsx';
import ShowCompany, { ShowFileRoutes } from './pages/ShowFile/ShowCompany.tsx';
import { createClient } from '@supabase/supabase-js';
import { SelectCompanyProfile } from './SelectCompanyProfile.tsx';
import { registerPlugin } from 'react-filepond';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        // if there is selected profile id, redirect to file/:id
        loader: () => {
          const id = localStorage.getItem('selectedProfileId');
          if (id) return redirect(`/company/${id}`);
          return redirect('/select-company-profile');
        },
      },
      {
        path: '/files-i-own',
        element: <HomePage />,
      },
      {
        path: '/create-file',
        element: <CreateFile />,
      },
      {
        path: '/company/:id',
        element: <ShowCompany />,
        children: ShowFileRoutes,
      },
    ],
  },
  {
    path: '/select-company-profile',
    element: <SelectCompanyProfile />,
  },
]);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className={'bg-gray-100 dark:bg-gray-800 min-h-screen'}>
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>,
);
