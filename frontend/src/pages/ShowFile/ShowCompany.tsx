import axios from 'axios';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../main.tsx';
import Profile from './Profile.tsx';
import ManageFolders from './ManageFolders.tsx';
import { CompanyRequirementsProgress } from './UploadFilesPages/CompanyRequirementsProgress.tsx';
import InvestmentDeck from './UploadFilesPages/InvestmentDeck.tsx';
import CompanyDocuments from './UploadFilesPages/CompanyDocuments.tsx';
import ExploreFiles from './ExploreFiles.tsx';
import Members from './Members.tsx';
import { SiIcons8 } from 'react-icons/si';
import UploadFiles from './UploadFilesPages/UploadFiles.tsx';

const Tabs = [
  { to: 'upload', label: 'Upload' },
  { to: 'explore', label: 'Explore' },
  { to: 'members', label: 'Members' },
];
export const ShowFileRoutes = [
  {
    path: '/company/:id/profile',
    element: <Profile />,
  },
  {
    path: '/company/:id/upload',
    element: <ManageFolders />,
  },
  {
    path: '/company/:id/upload/*',
    element: <UploadFiles />,
  },
  {
    path: '/company/:id/explore',
    element: <ExploreFiles />,
  },
  {
    path: '/company/:id/members',
    element: <Members />,
  },
];

export interface ShortFileContentSchema {
  id: number;
  company_name: string;
  company_logo: string;
  company_description: string;
}

export interface FileContentSchema {
  file?: {
    company_name?: string;
    company_logo?: string;
  };

  content?: {
    id?: number;
    file_id?: number;
    content_url: string;
  }[];
}

const ShowCompany = () => {
  // from path get the file id /file/:id
  const [companyId, setCompanyId] = useState<number | null>(
    localStorage.getItem('selectedProfileId') ? Number(localStorage.getItem('selectedProfileId')) : null,
  );
  const [file, setFile] = useState<FileContentSchema>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) throw new Error('No session found');
      axios
        .get('http://localhost:8000/get-file/' + companyId, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        .then((response) => {
          console.log(response.data);
          setFile(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }, [companyId]);

  useEffect(() => {
    // get from local storage the selected profile id
    const id = localStorage.getItem('selectedProfileId');
    setCompanyId(Number(id));
  }, []);

  const navigate = useNavigate();

  // if no tab is selected, default to upload
  if (!Tabs.some((tab) => window.location.pathname.includes(tab.to))) {
    navigate(`/company/${companyId}/upload`);
  }
  return (
    <>
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px pl-10 ">
          {Tabs.map((tab, index) => (
            <li key={index} className="me-2">
              <NavLink
                to={tab.to}
                relative={'route'}
                className={({ isActive }) => {
                  if (isActive)
                    return 'inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500';
                  return 'inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300';
                }}
              >
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-10">
        <Outlet />
      </div>
    </>
  );
};

export default ShowCompany;
