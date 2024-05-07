import { FilePond } from 'react-filepond';
import { FilePondFile } from 'filepond';
import React, { useEffect, useState } from 'react';
import { NavLink, useMatches, useNavigate } from 'react-router-dom';
import { sections } from '../ManageFolders.tsx';
import { Badge, Breadcrumb, Button } from 'flowbite-react';
import { HiHome } from 'react-icons/hi2';
import { supabase } from '../../../main.tsx';
import axios from 'axios';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { AiFillDelete } from 'react-icons/ai';
import { FaFilePowerpoint, FaRegFileExcel, FaRegFilePdf, FaRegFileWord } from 'react-icons/fa';
import { BsFiletypePng } from 'react-icons/bs';

const GetFileIcon = (mimeType: string) => {
  switch (mimeType) {
    case 'application/pdf':
      return <FaRegFilePdf className="w-6 h-6 text-red-600" />;
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return <FaRegFileWord className="w-6 h-6 text-blue-600" />;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return <FaRegFileExcel className="w-6 h-6 text-green-600" />;
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return <FaFilePowerpoint className="w-6 h-6 text-red-600" />;
    default:
      return <BsFiletypePng className="w-6 h-6 text-blue-600" />;
  }
};

const UploadFiles = () => {
  const [files, setFiles] = useState<FilePondFile[]>([]);
  const matches = useMatches();
  // const selectedDocument = matches[0].params['*'];
  const [selectedDocument, setSelectedDocument] = useState('');
  const navigate = useNavigate();
  const [session, setSession] = useState<null | unknown>(null);

  const [documentFiles, setDocumentFiles] = useState([]);
  useEffect(() => {
    const selectedSection = sections.find((section) => section.link === matches[0].params['*']);
    // if selectedSection is not null, set the selected document
    if (selectedSection) setSelectedDocument(selectedSection?.title);
    // redirect to upload
    else return navigate(`/company/${localStorage.getItem('selectedProfileId')}/upload`);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) throw new Error('No session found');
      setSession(session);
      axios
        .get(
          'http://localhost:8000/get-company-files' +
            '?company_id=' +
            localStorage.getItem('selectedProfileId') +
            '&document=' +
            selectedSection?.title,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        )
        .then(({ data }) => {
          console.log(data);
          setDocumentFiles(data);
        });
    });
  }, [matches]);

  const [viewedDocument, setViewedDocument] = useState(null);

  return (
    <div className="space-y-6">
      <Breadcrumb aria-label="Default breadcrumb example">
        <NavLink to={`/company/${localStorage.getItem('selectedProfileId')}/upload`}>
          <Breadcrumb.Item icon={HiHome}>Manage Folders</Breadcrumb.Item>
        </NavLink>
        <Breadcrumb.Item>Upload {selectedDocument}</Breadcrumb.Item>
      </Breadcrumb>

      <h3 className="text-xl font-medium text-gray-900 dark:text-white">
        Upload your <span className="text-blue-600">{selectedDocument}</span> files
      </h3>
      <hr className="border-gray-200 dark:border-gray-700" />
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Drag and drop your files here</h4>
      <div>
        <FilePond
          onupdatefiles={setFiles}
          allowMultiple={true}
          maxFiles={10}
          server={{
            revert: {
              url: 'http://localhost:8000/reverse-upload',
              method: 'DELETE',
              withCredentials: false,
              headers: {
                Authorization: `Bearer ${session ? session.access_token : ''}`,
              },
              timeout: 7000,
              onload: (response) => {
                console.log(response);
                // setDocumentFiles(response);
              },
              ondata: (formData) => {
                debugger;
                formData.append('document', selectedDocument);
                // company id
                formData.append('company_id', localStorage.getItem('selectedProfileId'));
                // folder id
                formData.append('folder_id', matches[0].params['*']);

                return formData;
              },
              onerror: (response) => {
                console.error(response);
              },
            },
            process: {
              url: 'http://localhost:8000/upload',
              method: 'POST',
              withCredentials: false,
              headers: {
                Authorization: `Bearer ${session ? session.access_token : ''}`,
              },
              timeout: 7000,
              ondata: (formData) => {
                formData.append('document', selectedDocument);
                // company id
                formData.append('company_id', localStorage.getItem('selectedProfileId'));
                // folder id
                formData.append('folder_id', matches[0].params['*']);

                return formData;
              },
              onerror: (response) => {
                console.error(response);
              },
            },
          }}
          name="file" /* sets the file input name, it's filepond by default */
          labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        />
      </div>

      {/*virtical split left the list of docs*/}
      {/*right is the preview section*/}
      <div className="flex items-center justify-between space-x-4">
        {/*  document list section */}
        <div className="w-1/2">
          {documentFiles.map((document) => {
            return (
              <div
                className={`flex content-start justify-between p-4 my-3 space-x-4 border border-gray-200 dark:border-gray-700 rounded-lg ${
                  viewedDocument === document.content_url ? 'bg-gray-100 dark:bg-gray-800' : ''
                }
                
                `}
                key={document.id}
              >
                {GetFileIcon(document.mime_type)}
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  <pre>{document.file_name}</pre>
                </h4>
                <Badge color="info">
                  {
                    // random from
                    ['company resources', 'company policies', 'company documents'][Math.floor(Math.random() * 3)]
                  }
                </Badge>
                <div className="flex items-center space-x-4">
                  <Button size={'sm'} color={'blue'} onClick={() => setViewedDocument(document.content_url)}>
                    View
                  </Button>
                  <Button
                    size={'sm'}
                    color={'red'}
                    onClick={() => {
                      axios
                        .delete('http://localhost:8000/upload', {
                          params: {
                            content_url: document.content_url,
                            company_id: localStorage.getItem('selectedProfileId'),
                            document: selectedDocument,
                            // file_name
                            // company_id
                            // document
                          },
                          headers: {
                            Authorization: `Bearer ${session.access_token}`,
                          },
                        })
                        .then((data) => {
                          console.log(data);
                          setDocumentFiles(data.data);
                        });
                    }}
                  >
                    <AiFillDelete className="w-4 h-4 me-1" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-1/2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Preview</h1>
          <div className="flex items-center justify-between p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-full">
            {
              // if no document is selected
              !viewedDocument && (
                <div className="flex items-center justify-center w-full h-full">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">No document selected</h4>
                </div>
              )
            }
            {
              // if document is selected
              viewedDocument && (
                <DocViewer
                  className={'h-full'}
                  documents={[viewedDocument].map((d) => {
                    return { uri: d };
                  })}
                  pluginRenderers={DocViewerRenderers}
                />
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;
