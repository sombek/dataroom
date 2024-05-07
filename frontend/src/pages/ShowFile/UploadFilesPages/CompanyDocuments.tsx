import { Badge, Checkbox, Table, Button, Label, Modal, TextInput } from 'flowbite-react';

import { HiClock } from 'react-icons/hi2';
import { useState } from 'react';
import { FilePond } from 'react-filepond';
import { FilePondFile } from 'filepond';

const initialDocuments = [
  {
    name: 'Certificate of Registration',
    description: 'السجل القانوني والتجاري للشركة',
  },
  {
    name: 'Capitalization Table',
    description: 'جدول توزيع الحصص',
  },
  {
    name: 'The Term Sheet',
    description: 'الاتفاقية الأولية بين المستثمرين',
  },
  {
    name: 'Amended & Restated Articles of Incorporation',
    description: 'عقود التأسيس المصدرة والمعدلة',
  },
  {
    name: 'Shareholder Agreement',
    description: 'اتفاقية مالكي الحصص',
  },
  {
    name: 'Investor Rights Agreement',
    description: 'اتفاقية حقوق المستثمرين',
  },
];
const UploadModal = ({ openModal, setOpenModal, selectedDocument }) => {
  const [email, setEmail] = useState('');
  // if escape key is pressed
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpenModal(false);
    }
  });
  const [files, setFiles] = useState<FilePondFile[]>([]);

  function onCloseModal() {
    console.log(setOpenModal);
    setOpenModal(false);
    setEmail('');
  }

  return (
    <Modal show={openModal} size="xl2" onClose={onCloseModal}>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Upload your <span className="text-blue-600">{selectedDocument}</span>
          </h3>
          <div className="App">
            <FilePond
              onupdatefiles={setFiles}
              allowMultiple={true}
              maxFiles={10}
              server={{
                url: 'http://localhost:8000/upload',
                // append bearer token to file upload
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                process: {
                  method: 'POST',
                  withCredentials: false,
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                  timeout: 7000,
                  ondata: (formData) => {
                    formData.append('document', selectedDocument);
                    // company id
                    formData.append('company_id', '1');
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
        </div>
      </Modal.Body>
    </Modal>
  );
};
const CompanyDocuments = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  function showUploadModal(name: string) {
    return () => {
      setOpenModal(true);
      setSelectedDocument(name);
    };
  }

  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Description</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Action</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {initialDocuments.map((document, index) => {
            return (
              <Table.Row key={index}>
                <Table.Cell>{document.name}</Table.Cell>
                <Table.Cell>{document.description}</Table.Cell>
                <Table.Cell>
                  <Badge color="gray" icon={HiClock}>
                    Pending
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge onClick={showUploadModal(document.name)} className={'cursor-pointer'}>
                    Upload
                  </Badge>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      <UploadModal openModal={openModal} setOpenModal={setOpenModal} selectedDocument={selectedDocument} />
    </div>
  );
};

export default CompanyDocuments;
