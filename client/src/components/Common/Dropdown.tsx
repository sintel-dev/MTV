import React, { Component } from 'react';
import Select from 'react-select';

type DropdownOption = {
  label: string;
  icon: string;
};

type FilterOptions = {
  value: string;
  label: string;
  icon?: string;
  isFixed?: boolean;
};

type Props = {
  onChange: (tag) => any;
  isSearchable?: boolean;
  isMulti?: boolean;
  closeMenuOnSelect?: boolean;
  value?: string | undefined;
  placeholder?: string;
  options?: FilterOptions[];
  formatLabel?: boolean;
  isDisabled?: boolean;
};

const optionsKnown: DropdownOption[] = [
  { label: 'Investigate', icon: 'investigate' },
  { label: 'Do not Investigate', icon: 'not_investigate' },
  { label: 'Postpone', icon: 'postpone' },
];

const optionsUnknown: DropdownOption[] = [
  { label: 'Problem', icon: 'problem' },
  { label: 'Previously seen', icon: 'seen' },
  { label: 'Normal', icon: 'normal' },
];

export const grouppedOptions = [
  {
    label: 'Known',
    options: optionsKnown,
  },
  {
    label: 'Unknown',
    options: optionsUnknown,
  },
];

export const filterOptions: FilterOptions[] = [
  { value: 'Investigate', label: 'Investigate', icon: 'investigate', isFixed: true },
  { value: 'Do not Investigate', label: 'Do not Investigate', icon: 'not_investigate', isFixed: true },
  { value: 'Postpone', label: 'Postpone', icon: 'postpone', isFixed: true },
  { value: 'Problem', label: 'Problem', icon: 'problem', isFixed: true },
  { value: 'Previously seen', label: 'Previously seen', icon: 'seen', isFixed: true },
  { value: 'Normal', label: 'Normal', icon: 'normal', isFixed: true },
];

export const formatOptionLabel = (props: DropdownOption) => {
  const { label, icon } = props;
  return (
    <div className="select-row">
      <i className={`select ${icon}`} />
      <span>{label}</span>
    </div>
  );
};

export class Dropdown extends Component<Props> {
  static defaultProps = {
    placeholder: 'Select a tag',
    isMulti: false,
    isSearchable: false,
    closeMenuOnSelect: true,
    options: filterOptions,
    formatLabel: true,
    isDisabled: false,
  };

  render() {
    const {
      onChange,
      isSearchable,
      isMulti,
      closeMenuOnSelect,
      value,
      placeholder,
      options,
      formatLabel,
      isDisabled,
    } = this.props;

    return (
      <Select
        formatOptionLabel={formatLabel && formatOptionLabel}
        options={options}
        classNamePrefix="tag-options"
        className="tag-select"
        placeholder={placeholder}
        onChange={onChange}
        isSearchable={isSearchable}
        isMulti={isMulti}
        closeMenuOnSelect={closeMenuOnSelect}
        value={value}
        isDisabled={isDisabled}
      />
    );
  }
}

export default Dropdown;
