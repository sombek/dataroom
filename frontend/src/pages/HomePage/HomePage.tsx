import { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from '../../main.tsx';
import { Link } from 'react-router-dom';
import { ShortFileContentSchema } from '../ShowFile/ShowCompany.tsx';

const FileCard = ({ file }: { file: ShortFileContentSchema }) => {
  return (
    <Link
      to={'/company/' + file.id + '/profile'}
      className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
    >
      <img
        className="rounded-t-lg bg-gray-200 dark:bg-gray-700 h-56 w-full object-cover object-center"
        src={file.company_logo}
        alt="Image"
      />
      <div className="p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{file.company_name}</h5>
        <p className="mb-3 text-gray-700 dark:text-gray-400">{file.company_description}</p>
        <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Access File Content
          <svg
            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </button>
      </div>
    </Link>
  );
};

const HomePage = () => {
  const [files, setFiles] = useState([]);

  // print jwt token on component mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) throw new Error('No session found');
      // call http api
      axios
        .get('http://localhost:8000/get-files', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        .then((response) => {
          setFiles(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Available Files
      </h1>
      <hr className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file, index) => (
          <FileCard key={index} file={file} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
