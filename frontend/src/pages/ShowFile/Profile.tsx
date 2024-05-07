import { useParams } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../../main.tsx';
import { useEffect, useState } from 'react';
import { FileContentSchema } from './ShowCompany.tsx';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';

const Profile = () => {
  const { id } = useParams();
  const [file, setFile] = useState<FileContentSchema>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) throw new Error('No session found');
      axios
        .get('http://localhost:8000/get-file/' + id, {
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
  }, []);

  return (
    <div className="container mx-auto p-4">
      <JSONPretty id="json-pretty" data={file.file}></JSONPretty>
    </div>
  );
};

export default Profile;
