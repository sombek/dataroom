import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { supabase } from './main.tsx';
import { Avatar, Button, Dropdown, Tabs } from 'flowbite-react';
import { HiAdjustments, HiClipboardList, HiUserCircle } from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';
import { AiFillSwitcher } from 'react-icons/ai';
import axios from 'axios';

export default function App() {
  const [session, setSession] = useState<null | unknown>(null);
  // loading until session is fetched
  const [loading, setLoading] = useState(true);
  // get the selected company from storage
  const selectedCompany = localStorage.getItem('selectedProfileId');
  const [file, setFile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session && selectedCompany) {
        axios
          .get('http://localhost:8000/get-file/' + selectedCompany, {
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
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="text-center flex justify-center items-center h-screen">Loading...</div>;
  if (!session) return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  if (!file) return <div className="text-center flex justify-center items-center h-screen">Loading...</div>;
  return (
    <div>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
          <div className="flex items-center space-x-4">
            <img src="/img_4.png" className="h-12" alt="Flowbite Logo" />
            <Dropdown
              inline
              label={
                <div className="flex items-center space-x-2">
                  <Avatar img={file && file.file.company_logo} size="sm" />
                  <h1 className="text-md font-semibold text-gray-900 dark:text-white">Anker Inc.</h1>
                </div>
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">{session.user.email}</span>
                <span className="block truncate text-sm font-medium">{session.user.role}</span>
              </Dropdown.Header>
              <Dropdown.Item>
                <NavLink to="/select-company-profile" className="flex items-center space-x-2">
                  <AiFillSwitcher className="w-4 h-4 mr-2" />
                  Switch Company
                </NavLink>
              </Dropdown.Item>
              <Dropdown.Item>
                <HiUserCircle className="w-4 h-4 mr-2" />
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>
                <HiClipboardList className="w-4 h-4 mr-2" />
                Sign out
              </Dropdown.Item>
            </Dropdown>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-sm font-bold text-gray-900 dark:text-white hover:underline">
              Support
            </a>
            <a href="#" className="text-sm font-bold text-gray-900 dark:text-white hover:underline">
              Docs
            </a>
            <Button size="sm">Feedback</Button>
          </div>
        </div>
        <Outlet />
      </nav>
    </div>
  );
}
