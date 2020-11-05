import React, { useState } from 'react';
import { ArrowUp, CloseIcon, DownloadIcon, LogoutIcon, UploadIcon } from 'src/components/Common/icons';
import Button from 'react-bootstrap/Button';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import SelectDropDown from '../components/SelectDropdown';

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
// import '../general.scss';
// import 'bootstrap/dist/css/bootstrap.min.css';

const StyleGuide = () => {
  const [isDropdownOpen, toggleDropdown] = useState(false);
  const toggle = () => toggleDropdown(!isDropdownOpen);

  return (
    <div className="styleguide">
      <div className="wrapper">
        <ButtonDropdown isOpen={isDropdownOpen} toggle={toggle} direction="right">
          <span>right</span>
          <DropdownToggle className="icon">
            <SortIcon />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem>Option one</DropdownItem>
            <DropdownItem>Option two</DropdownItem>
            <DropdownItem>Option three</DropdownItem>
            <DropdownItem>Option four</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      </div>

      <div className="wrapper">
        <ul className="union-list">
          <li>
            <button type="button" className="info active">
              <span>Pre-defined</span>
              <span>6</span>
            </button>
          </li>
          <li>
            <button type="button" className="info">
              <span>Composed</span>
              <span>3</span>
            </button>
          </li>
        </ul>
      </div>
      <div className="wrapper">
        <SelectDropDown
          onSelect={(value) => console.log(value)}
          labelValue="Counter Value Dropdown"
          isMulti
          closeOnSelect={false}
          enableCounter
        />
      </div>
      <div className="wrapper">
        <SelectDropDown
          onSelect={(value) => console.log(value)}
          labelValue="Multi option, Close on select - false"
          isMulti
          closeOnSelect={false}
        />
      </div>
      <div className="wrapper">
        <SelectDropDown
          onSelect={(value) => console.log(value)}
          labelValue="Multi option, Close on select - true"
          isMulti
        />
      </div>
      <div className="wrapper">
        <SelectDropDown onSelect={(value) => console.log(value)} labelValue="Single option" />
      </div>
      <div className="wrapper">
        <SelectDropDown labelValue="Disabled" isDisabled />
      </div>
      <div className="wrapper">
        <h1>Heading 1 f48/w700 </h1>
        <h2>Heading 2 f32/w700</h2>
        <h3>heading 3 f24/w500</h3>
        <h4>Heading 4 f20/w500</h4>
        <h5>Heading 5 f20/w400</h5>
      </div>
      <div className="wrapper">
        <h1 className="weight-700">Heading 1 className="weight-700" </h1>
        <h1 className="weight-500">Heading 1 className="weight-500" </h1>
        <h1 className="weight-400">Heading 1 className="weight-400"</h1>
        <h1 className="weight-300">Heading 1 className="weight-300"</h1>
        <h2 className="weight-700">Heading 2 className="weight-700"</h2>
        <h2 className="weight-500">Heading 2 className="weight-500"</h2>
        <h2 className="weight-300">Heading 2 className="weight-400"</h2>
        <h2 className="weight-300">Heading 2 className="weight-300"</h2>
        and so on
      </div>

      <div className="wrapper">
        <h2>
          <button type="button">
            <SortIcon />
          </button>
          <span>Heading with sort icon</span>
          <span className="filter">0</span>
        </h2>
      </div>

      <div className="subtitle">subtitle f16/w700</div>
      <div className="subtitle _medium">.subtitle ._medium f16/w400</div>
      <div className="subtitle _small">.subtitle ._small f14/w400</div>
      <div className="subtitle _small_bold">.subtitle ._small_bold f14/w700</div>
      <div className="subheading">.subheading f16/w400</div>
      <div className="subheading _medium">.subheading ._medium f14/w400</div>
      <div className="caption">.caption f12/w300</div>
      <div className="caption _small">.caption ._small f10/w500</div>
      <div className="wrapper">
        <div className="subtitle">Icons</div>
        <ul className="inline">
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
};

export default StyleGuide;
