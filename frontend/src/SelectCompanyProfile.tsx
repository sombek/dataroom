import { useEffect, useState } from 'react';
import { supabase } from './main.tsx';
import axios from 'axios';
import { DocumentIcon } from '@heroicons/react/16/solid';
import { Link } from 'react-router-dom';

export function SelectCompanyProfile() {
  // set in local storage the selected profile id
  const selectProfile = (id: number) => {
    localStorage.setItem('selectedProfileId', String(id));
  };
  const [availableProfiles, setAvailableProfiles] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) throw new Error('No session found');

      axios
        .get('http://localhost:8000/get-files', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })
        .then((response) => {
          setAvailableProfiles(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }, []);

  // show it like netflix profile selection
  // Title: Which company are you managing today?
  // list of companies in a row middle aligned with their logo
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Which company are you managing today?</h1>

        <div className="flex flex-wrap justify-center">
          {availableProfiles.map((profile: any, index: number) => (
            <Link
              key={index}
              className="flex flex-col items-center space-y-2 m-2 p-2 border rounded-lg shadow-md hover:shadow-lg cursor-pointer transition duration-300 ease-in-out bg-white dark:bg-gray-700 dark:border-gray-600 dark:hover:shadow-xl dark:text-gray-300"
              onClick={() => selectProfile(profile.id)}
              to={`/company/${profile.id}`}
            >
              <img src={profile.company_logo} alt={profile.company_name} className="w-20 h-20" />
              <p>{profile.company_name}</p>
            </Link>
          ))}
        </div>

        <button
          className="
            flex items-center justify-center p-2 text-sm font-medium
            accent-gray-400 bg-gray-100 rounded-lg hover:bg-gray-200
            "
        >
          <DocumentIcon className="w-5 h-5" />
          Manage Company Profiles
        </button>
      </div>
    </div>
  );
}
