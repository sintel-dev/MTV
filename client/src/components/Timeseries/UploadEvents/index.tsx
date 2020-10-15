import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody, ModalFooter } from 'react-bootstrap';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { loadEventsFromJsonAction } from 'src/model/actions/events';
import { getUploadEventsStatus } from 'src/model/selectors/events';
import { RootState } from 'src/model/types';
import Droppable from './Droppable';
import './UploadEvents.scss';

type Ownprops = {
  isUploadModalVisible: boolean;
  toggleModalState: Function;
};

type State = {
  uploadStep: number;
  currentFiles: Array<any>;
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

type Props = StateProps & DispatchProps & Ownprops;

const codeString = `
    {
      "events": [{
        "signal_id": "221"
        "start_time": 1396332000,
        "stop_time": 1396461600,
        …
      },
        …
      ]
    }`;

class UploadEvents extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      uploadStep: 2,
      currentFiles: [],
    };
    this.onAddFiles = this.onAddFiles.bind(this);
    this.onRemoveFile = this.onRemoveFile.bind(this);
  }

  private switchStep(): void {
    const { uploadStep } = this.state;
    this.setState({
      uploadStep: uploadStep + 1,
    });
  }

  private onAbortUpload(): void {
    this.props.toggleModalState(false);
    this.setState({
      uploadStep: 1,
      currentFiles: [],
    });
  }

  private onAddFiles(newFiles) {
    const { currentFiles } = this.state;
    const combined = currentFiles;

    newFiles.map((file) => combined.push(file));

    this.setState({
      currentFiles: combined,
    });
  }

  private retryUpload(): void {
    this.setState({
      uploadStep: 2,
      currentFiles: [],
    });
  }

  onRemoveFile(file) {
    const { currentFiles } = this.state;
    currentFiles.forEach((currentFile, index) => {
      if (currentFile.name === file.name) {
        currentFiles.splice(index, 1);
      }
    });

    this.setState({
      currentFiles,
    });
  }

  private renderModalContent(): ReactNode | null {
    const { uploadStep } = this.state;
    const { uploadStatus } = this.props;

    const modalContent = (): ReactNode => {
      if (uploadStatus && uploadStatus === 'success') {
        return (
          <div>
            <p>JSON files uploaded successful</p>
          </div>
        );
      }

      switch (uploadStep) {
        case 1:
          return (
            <div>
              <p>Your .JSON file should follow this example:</p>
              <SyntaxHighlighter style={dracula}>{codeString}</SyntaxHighlighter>
              <div className="upload-info">
                <input type="checkbox" id="hideInfo" />
                <label htmlFor="hideInfo">Do not show me again</label>
              </div>
            </div>
          );
        case 2:
          return (
            <Droppable
              onAddFiles={this.onAddFiles}
              onRemoveFile={this.onRemoveFile}
              currentFiles={this.state.currentFiles}
            />
          );
        default:
          return null;
      }
    };

    return modalContent();
  }

  renderModalFooter(): ReactNode | null {
    const { uploadStep } = this.state;
    const { uploadStatus } = this.props;
    const btnStyles = 'btn-controls';

    const modalButtons = (): ReactNode => {
      if (uploadStatus === 'fail' && this.state.currentFiles.length) {
        return (
          <ul className={`${btnStyles} load`}>
            <li>
              <button type="button" onClick={() => this.onAbortUpload()}>
                Cancel
              </button>
            </li>
            <li>
              <button type="button" className="upload" onClick={() => this.retryUpload()}>
                Retry
              </button>
            </li>
          </ul>
        );
      }

      switch (uploadStep) {
        case 1:
          return (
            <ul className={btnStyles}>
              <li>
                <button type="button" onClick={() => this.switchStep()}>
                  Continue &gt;
                </button>
              </li>
            </ul>
          );
        case 2:
          return (
            <ul className={`${btnStyles} load`}>
              <li>
                <button type="button" onClick={() => this.onAbortUpload()}>
                  Cancel
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="upload"
                  disabled={!this.state.currentFiles.length}
                  onClick={() => this.props.loadEvents(this.state.currentFiles)}
                >
                  Load file
                </button>
              </li>
            </ul>
          );
        default:
          return null;
      }
    };

    return <div>{modalButtons()}</div>;
  }

  render() {
    return (
      this.props.isUploadModalVisible && (
        <Modal
          show={this.props.isUploadModalVisible}
          centered
          onHide={() => this.onAbortUpload()}
          className="upload-modal"
        >
          <Modal.Header closeButton>Loading .JSON file</Modal.Header>
          <ModalBody>
            <div>{this.renderModalContent()}</div>
          </ModalBody>
          <ModalFooter>{this.renderModalFooter()}</ModalFooter>
        </Modal>
      )
    );
  }
}

const mapState = (state) => ({
  uploadStatus: getUploadEventsStatus(state),
});

const mapDispatch = (dispatch: Function) => ({
  loadEvents: (jsonEvents) => dispatch(loadEventsFromJsonAction(jsonEvents)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(UploadEvents);
