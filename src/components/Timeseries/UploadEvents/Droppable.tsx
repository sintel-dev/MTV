import React, { ReactNode } from 'react';
import Dropzone from 'react-dropzone';
import { FolderIcon } from '../../Common/icons';

type Props = {
  onAddFiles: Function;
  onRemoveFile: Function;
  currentFiles: Array<any>;
};

const Droppable: React.FC<Props> = ({ onAddFiles, onRemoveFile, currentFiles }: Props) => {
  const listAddedFiles = (): ReactNode =>
    (currentFiles.length && (
      <ul className="existing-files">
        {currentFiles.map((file) => (
          <li key={`${file.name}${file.path}`}>
            <FolderIcon />
            <span>{file.name}</span>
            <i className="remove-file" onClick={() => onRemoveFile(file)}>
              x
            </i>
          </li>
        ))}
      </ul>
    )) ||
    null;

  return (
    <Dropzone accept="application/json" onDrop={(acceptedFiles) => onAddFiles(acceptedFiles)}>
      {({ getRootProps, getInputProps }) => (
        <section className="drop-zone">
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>
              Drag and drop a file here, <span>or choose file</span>
            </p>
          </div>
          {listAddedFiles()}
        </section>
      )}
    </Dropzone>
  );
};

export default Droppable;
