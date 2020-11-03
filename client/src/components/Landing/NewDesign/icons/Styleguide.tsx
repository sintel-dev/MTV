import React from 'react';
import { ArrowUp, CloseIcon, DownloadIcon, LogoutIcon, UploadIcon } from 'src/components/Common/icons';
import {
  AddIcon,
  ArrowUpThin,
  CheckboxActive,
  CheckboxDefault,
  CheckboxDeselectAll,
  ClearIcon,
  DatabaseIcon,
  ExperimentIcon,
  LineChartIcon,
  NoSelectionIcon,
  PipelinesIcon,
  SortIcon,
  StepChartIcon,
  ViewMore,
} from './icons';
import './Styleguide.scss';

const StyleGuide = () => (
  <div className="styleguide">
    <h1>Heading 1</h1>
    <h2>Heading 2</h2>
    <h3>heading 3</h3>
    <h4>Heading 4</h4>
    <h5>Heading 5</h5>
    <div className="subtitle">subtitle</div>
    <div className="subtitle _medium">Subtitle medium</div>
    <div className="subtitle _small">Subtitle small</div>
    <div className="subheading">Subheading</div>
    <div className="subheading _medium">Subheading medium</div>
    <div className="caption">Caption</div>
    <div className="caption _small">Caption small</div>
    <div className="wrapper">
      <div className="subtitle">Icons</div>
      <ul>
        <li>
          <span className="icon">
            <i>
              <ClearIcon />
            </i>
            <span>ClearIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <ArrowUp />
            </i>
            <span>ArrowUp</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <SortIcon />
            </i>
            <span>SortIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <LogoutIcon />
            </i>
            <span>LogoutIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <ArrowUpThin />
            </i>
            <span>ArrowUpThin</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <ViewMore />
            </i>
            <span>ViewMore</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <AddIcon />
            </i>
            <span>AddIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <UploadIcon />
            </i>
            <span>UploadIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <DownloadIcon />
            </i>
            <span>DownloadIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <LineChartIcon />
            </i>
            <span>LineChartIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <StepChartIcon />
            </i>
            <span>StepChartIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <CloseIcon />
            </i>
            <span>CloseIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <CheckboxDefault />
            </i>
            <span>CheckboxDefault</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <CheckboxActive />
            </i>
            <span>CheckboxActive</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <CheckboxDeselectAll />
            </i>
            <span>CheckboxDeselectAll</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <DatabaseIcon />
            </i>
            <span>DatabaseIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <PipelinesIcon />
            </i>
            <span>PipelinesIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <ExperimentIcon />
            </i>
            <span>ExperimentIcon</span>
          </span>
        </li>
        <li>
          <span className="icon">
            <i>
              <NoSelectionIcon />
            </i>
            <span>NoSelectionIcon</span>
          </span>
        </li>
      </ul>
    </div>
    <div className="wrapper">
      <div className="subtitle">Buttons</div>
      <ul>
        <li>
          <button type="button">Default</button>
        </li>
        <li>
          <button type="button" disabled>
            Disabled
          </button>
        </li>
        <li>
          <button type="button" className="blue">
            className blue
          </button>
        </li>
        <li>
          <button type="button" className="red">
            className red
          </button>
        </li>
        <li>
          <button type="button" className="filled blue">
            Button &quot;filled blue&quot;
          </button>
        </li>
        <li>
          <button type="button" className="filled blue" disabled>
            Filled blue and disabled
          </button>
        </li>
      </ul>
    </div>
    <div className="wrapper">
      <div className="subtitle">Form Elements</div>
      <ul>
        <li>
          <input type="text" placeholder="Search" />
        </li>
        <li>
          <input type="password" defaultValue="somepassword" />
        </li>
      </ul>
    </div>
    <div className="wrapper">
      <span className="filter">
        <span>filter</span>
        <i>
          <CloseIcon />
        </i>
      </span>
      <span className="info-text">info text</span>
    </div>
  </div>
);

export default StyleGuide;
