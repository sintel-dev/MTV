import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { LogoutIcon } from 'src/components/Common/icons';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {
  DatabaseIcon,
  ExperimentIcon,
  InfoIcon,
  MtvLogo,
  PipelinesIcon,
  SortIcon,
  SuccessIcon,
  TempMatrix,
  Vector,
} from './icons/icons';
import SelectDropDown from './components/SelectDropdown';
import './Homepage.scss';
import ModalWindow from './components/ModalWindow';

type State = {
  isSortingOpen: boolean;
  isCardsOpen: boolean;
};

const CardsContent = () => (
  <div>
    <p className="info-text">
      Filter by selecting from the dropdowns below and then select the desired signalruns to create a composed card
    </p>
    <section className="modal-section">
      <div className="inline-items">
        <div className="item">
          <SelectDropDown displayLabel={false} />
        </div>
        <div className="item">
          <SelectDropDown displayLabel={false} />
        </div>
        <div className="item">
          <SelectDropDown displayLabel={false} />
        </div>
        <div className="results-count">
          <span>0</span>
          <span>Results</span>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Signal</th>
              <th>Pileline Name</th>
              <th>Aggregation level</th>
              <th>Date of creation</th>
              <th>No. of events</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="custom-checkbox">
                  <input type="checkbox" id="signalName" />
                  <label htmlFor="signalName" />
                </div>
              </td>
              <td>C-1</td>
              <td>LSTM</td>
              <td>6h</td>
              <td>Mon, 03 Sep 2012 11:03:05</td>
              <td>3</td>
            </tr>
            <tr>
              <td>
                <div className="custom-checkbox">
                  <input type="checkbox" id="signalName2" />
                  <label htmlFor="signalName2" />
                </div>
              </td>
              <td>C-1</td>
              <td>LSTM</td>
              <td>6h</td>
              <td>Mon, 03 Sep 2012 11:03:05</td>
              <td>3</td>
            </tr>
            <tr>
              <td>
                <div className="custom-checkbox">
                  <input type="checkbox" id="signalName3" />
                  <label htmlFor="signalName3" />
                </div>
              </td>
              <td>C-1</td>
              <td>LSTM</td>
              <td>6h</td>
              <td>Mon, 03 Sep 2012 11:03:05</td>
              <td>3</td>
            </tr>
            <tr>
              <td>
                <div className="custom-checkbox">
                  <input type="checkbox" id="signalName4" />
                  <label htmlFor="signalName4" />
                </div>
              </td>
              <td>C-1</td>
              <td>LSTM</td>
              <td>6h</td>
              <td>Mon, 03 Sep 2012 11:03:05</td>
              <td>3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

class Homepage extends Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = {
      isSortingOpen: false,
      isCardsOpen: true,
    };
  }

  componentDidMount() {
    document.querySelector('body').classList.add('homepage');
  }

  toggleDropdown() {
    const { isSortingOpen } = this.state;
    this.setState({
      isSortingOpen: !isSortingOpen,
    });
  }

  onSelectOption() {
    return console.log('Homepage onSelect option');
  }

  toggleCards() {
    const { isCardsOpen } = this.state;
    this.setState({
      isCardsOpen: !isCardsOpen,
    });
  }

  render() {
    const { isSortingOpen, isCardsOpen } = this.state;
    return (
      <div>
        <ModalWindow
          isModalOpen={isCardsOpen}
          onClose={() => this.toggleCards()}
          className="modal-cards"
          heading="Compose Card"
        >
          <CardsContent />
        </ModalWindow>
        <div className="header">
          <NavLink to="/homepage">
            <MtvLogo />
          </NavLink>
          <ul className="user-options">
            <li>User picture here</li>
            <li>User Name here</li>
            <li>
              <button type="button">
                <LogoutIcon />
              </button>
            </li>
          </ul>
        </div>

        <div className="home-wrapper">
          <div className="sidebar">
            <div className="item-container">
              <div className="heading">
                <h5 className="icon">
                  <i>
                    <DatabaseIcon />
                  </i>
                  <span>Dataset</span>
                </h5>
                <span className="filter">0</span>
              </div>
              <div className="details">
                <div className="row">
                  <SelectDropDown onSelect={() => this.onSelectOption()} labelValue="Select a Dataset" />
                </div>
                <div className="row">
                  <p>Dataset Details</p>
                  <div className="item">
                    <span>Signals</span>
                    <span>55</span>
                  </div>
                  <div className="item">
                    <span>Pipelines</span>
                    <span>2</span>
                  </div>
                  <div className="item">
                    <span>Experiments</span>
                    <span>6</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="item-container">
              <div className="heading">
                <h5 className="icon">
                  <i>
                    <PipelinesIcon />
                  </i>
                  <span>Pipelines</span>
                </h5>
                <span className="filter">0</span>
              </div>
              <div className="details">
                <div className="row">
                  <SelectDropDown onSelect={() => this.onSelectOption()} labelValue="Select a Pipeline" />
                </div>
                <div className="row">
                  <p>Pipeline Details</p>
                  <div className="item">
                    <span>Created</span>
                    <span>55</span>
                  </div>
                  <div className="item">
                    <span>Creator</span>
                    <span>2</span>
                  </div>
                  <div className="item">
                    <span>Experiments</span>
                    <span>6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row spacer">
              <h4 className="weight-700">
                <ExperimentIcon />
                <span>Experiments</span>
                <span className="filter">0</span>
              </h4>
            </div>
            <div className="row spacer">
              <div className="options">
                <ul className="union-list">
                  <li>
                    <button type="button" className="info active">
                      <span>Predefined</span>
                      <span>0</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" className="info">
                      <span>Composed</span>
                      <span>0</span>
                    </button>
                  </li>
                </ul>
                <div className="sort-opts">
                  <ButtonDropdown isOpen={isSortingOpen} toggle={() => this.toggleDropdown()} direction="left">
                    <span>Sort by</span>
                    <DropdownToggle className="icon">
                      <SortIcon />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>Creator Name</DropdownItem>
                      <DropdownItem>
                        <Vector direction="up" />
                        Added Time
                        <SuccessIcon />
                      </DropdownItem>
                      <DropdownItem>
                        <Vector direction="up" />
                        Modified Time
                        <SuccessIcon />
                      </DropdownItem>
                      <DropdownItem>
                        <Vector direction="up" />
                        Number of Events
                        <SuccessIcon />
                      </DropdownItem>
                      <DropdownItem>
                        <Vector direction="up" />
                        Number of Signals
                        <SuccessIcon />
                      </DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </div>
              </div>
            </div>
            <div className="row spacer">
              <div className="inline-items">
                <div className="item">
                  <input type="text" placeholder="Search" />
                </div>
                <div className="item">
                  <SelectDropDown displayLabel={false} />
                </div>
                <div className="item">
                  <SelectDropDown displayLabel={false} />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="card-wrapper">
                <div className="card">
                  <p className="title">Title of card</p>
                  <div className="desc">
                    <p>
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ell Description
                      of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis Description of
                      said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                    </p>
                    <InfoIcon
                      dataTip="Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis"
                    />
                    <div className="clear" />
                  </div>

                  <div className="card-container">
                    <ul>
                      <li>
                        <span>Signals</span> <span>45</span>
                      </li>
                      <li>
                        <span>Events</span>
                        <span>7</span>
                      </li>
                      <li>
                        <span>Created</span>
                        <span>2019-10-17</span>
                      </li>
                      <li>
                        <span>Creator</span>
                        <span>null</span>
                      </li>
                    </ul>
                    <div className="card-matrix">
                      <TempMatrix />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <p className="title">Title of card</p>
                  <div className="desc">
                    <p>
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ell Description
                      of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis Description of
                      said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                    </p>
                    <InfoIcon
                      dataTip="Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis"
                    />
                    <div className="clear" />
                  </div>

                  <div className="card-container">
                    <ul>
                      <li>
                        <span>Signals</span> <span>45</span>
                      </li>
                      <li>
                        <span>Events</span>
                        <span>7</span>
                      </li>
                      <li>
                        <span>Created</span>
                        <span>2019-10-17</span>
                      </li>
                      <li>
                        <span>Creator</span>
                        <span>null</span>
                      </li>
                    </ul>
                    <div className="card-matrix">
                      <TempMatrix />
                    </div>
                  </div>
                </div>
                <div className="card">
                  <p className="title">Title of card</p>
                  <div className="desc">
                    <p>
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ell Description
                      of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis Description of
                      said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                    </p>
                    <InfoIcon
                      dataTip="Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis"
                    />
                    <div className="clear" />
                  </div>

                  <div className="card-container">
                    <ul>
                      <li>
                        <span>Signals</span> <span>45</span>
                      </li>
                      <li>
                        <span>Events</span>
                        <span>7</span>
                      </li>
                      <li>
                        <span>Created</span>
                        <span>2019-10-17</span>
                      </li>
                      <li>
                        <span>Creator</span>
                        <span>null</span>
                      </li>
                    </ul>
                    <div className="card-matrix">
                      <TempMatrix />
                    </div>
                  </div>
                </div>
                <div className="card">
                  <p className="title">Title of card</p>
                  <div className="desc">
                    <p>
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ell Description
                      of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis Description of
                      said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                    </p>
                    <InfoIcon
                      dataTip="Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis"
                    />
                    <div className="clear" />
                  </div>

                  <div className="card-container">
                    <ul>
                      <li>
                        <span>Signals</span> <span>45</span>
                      </li>
                      <li>
                        <span>Events</span>
                        <span>7</span>
                      </li>
                      <li>
                        <span>Created</span>
                        <span>2019-10-17</span>
                      </li>
                      <li>
                        <span>Creator</span>
                        <span>null</span>
                      </li>
                    </ul>
                    <div className="card-matrix">
                      <TempMatrix />
                    </div>
                  </div>
                </div>
                <div className="card">
                  <p className="title">Title of card</p>
                  <div className="desc">
                    <p>
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ell Description
                      of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis Description of
                      said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                    </p>
                    <InfoIcon
                      dataTip="Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis
                      Description of said card - can occupy a maximum of 2 rows. Extra will be hidden by ellipsis"
                    />
                    <div className="clear" />
                  </div>

                  <div className="card-container">
                    <ul>
                      <li>
                        <span>Signals</span> <span>45</span>
                      </li>
                      <li>
                        <span>Events</span>
                        <span>7</span>
                      </li>
                      <li>
                        <span>Created</span>
                        <span>2019-10-17</span>
                      </li>
                      <li>
                        <span>Creator</span>
                        <span>null</span>
                      </li>
                    </ul>
                    <div className="card-matrix">
                      <TempMatrix />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="clear" />
        </div>
      </div>
    );
  }
}

export default Homepage;
