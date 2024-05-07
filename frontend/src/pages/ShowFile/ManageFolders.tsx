import axios from 'axios';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../main.tsx';
import { Breadcrumb, Dropdown, ListGroup } from 'flowbite-react';
import { Tree } from 'react-arborist';
import DataTable from 'react-data-table-component';
import { FolderIcon } from '@heroicons/react/20/solid';
import {
  PiBookOpenText,
  PiDotsThree,
  PiDotsThreeCircleVertical,
  PiDotsThreeVertical,
  PiTextColumns,
} from 'react-icons/pi';
import { HiHome } from 'react-icons/hi2';

// const sections = ['Investment Deck', 'Company Documents', 'Board Material', 'Financials'];
export const sections = [
  {
    title: 'Investment Deck',
    link: 'investment-deck',
  },
  {
    title: 'Company Documents',
    link: 'company-documents',
  },
  {
    title: 'Board Material',
    link: 'board-material',
  },
  {
    title: 'Financials',
    link: 'financials',
  },
];
const data = [
  {
    id: 1,
    title: 'Investment Deck',
    link: 'investment-deck',
    by: 'me',
    lastOpened: 'Aug 7 9:52 AM',
  },
  {
    id: 2,
    title: 'Company Documents',
    link: 'company-documents',
    by: 'me',
    lastOpened: 'Sept 14 2:52 PM',
  },
  {
    id: 3,
    title: 'Board Material',
    link: 'board-material',
    by: 'me',
    lastOpened: 'Sept 12 2:41 PM',
  },
  {
    id: 4,
    title: 'Financials',
    link: 'financials',
    by: 'me',
    lastOpened: 'June 3 5:45 PM',
  },
];

const customStyles = {
  headRow: {
    style: {
      border: 'none',
    },
  },
  headCells: {
    style: {
      color: '#202124',
      fontSize: '14px',
    },
  },
  rows: {
    highlightOnHoverStyle: {
      backgroundColor: 'rgb(230, 244, 244)',
      borderBottomColor: '#FFFFFF',
      borderRadius: '25px',
      outline: '1px solid #FFFFFF',
    },
  },
  pagination: {
    style: {
      border: 'none',
    },
  },
};

const columns = [
  {
    cell: () => <FolderIcon style={{ fill: '#43a047' }} />,
    width: '56px', // custom width for icon button
    style: {
      borderBottom: '1px solid #FFFFFF',
      marginBottom: '-1px',
    },
  },
  {
    name: 'Title',
    selector: (row) => row.title,
    sortable: true,
    style: {
      color: '#202124',
      fontSize: '14px',
      fontWeight: 500,
    },
  },
  {
    name: 'Owner',
    selector: (row) => row.by,
    sortable: true,
    style: {
      color: 'rgba(0,0,0,.54)',
    },
  },
  {
    name: 'Last opened',
    selector: (row) => row.lastOpened,
    sortable: true,
    style: {
      color: 'rgba(0,0,0,.54)',
    },
  },
  {
    cell: (row) => (
      <div className={'w-56'}>
        <Dropdown
          label=""
          dismissOnClick={false}
          placement="bottom"
          renderTrigger={() => (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800">
              <PiDotsThreeVertical className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        >
          <div className="w-48 h-auto">
            <Dropdown.Item>
              <PiBookOpenText className="w-5 h-5 me-2" />
              Rename
            </Dropdown.Item>
          </div>
        </Dropdown>
      </div>
    ),
    width: '56px',
  },
];

const ManageFolders = () => {
  const { id } = useParams();
  const [session, setSession] = useState({});
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) throw new Error('No session found');
      setSession(session);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item icon={HiHome}>Manage Folders</Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload Files</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Showing 4 sections</p>
        <div className="flex items-center space-x-4">
          <button className="btn btn-secondary">New Folder</button>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      <DataTable
        columns={columns}
        data={data}
        customStyles={customStyles}
        highlightOnHover
        pointerOnHover
        onRowClicked={(row) => {
          console.log(row);
          navigate(`/company/${id}/upload/${row.link}`);
        }}
      />
    </div>
  );
};
export default ManageFolders;
