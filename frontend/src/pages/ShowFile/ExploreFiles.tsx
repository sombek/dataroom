import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../main.tsx';
import axios from 'axios';
import { FileContentSchema } from './ShowCompany.tsx';

const ExploreFiles = () => {
  const getFileType = (url: string) => {
    // if contains mp4 return mp4
    if (url.includes('.mp4')) return 'mp4';
    // if contains jpg return jpg
    if (url.includes('.jpg')) return 'jpg';
    // if contains png return png
    if (url.includes('.png')) return 'png';
    return 'png';
  };

  // from path get the file id /file/:id
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
  }, [id]);

  return (
    <div>
      {file.content && !file.content.length && <p>No content found</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {file.content &&
          file.content.map((content, index) => {
            if (getFileType(content.content_url) === 'mp4') {
              return (
                <div key={index} className="mb-4 card shadow-lg rounded-lg h-96">
                  <video src={content.content_url} controls className="w-full h-full object-cover" />
                </div>
              );
            }
            return (
              <div key={index} className="mb-4 card shadow-lg rounded-lg h-96">
                <img src={content.content_url} alt="content" className="w-full h-full object-cover" />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ExploreFiles;
