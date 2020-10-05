import React from 'react';
import Select from 'react-select';
import propTypes from 'prop-types';

type DropdownOptions = {
  label: string;
  icon: string;
};

type FilterOptions = {
  value: string;
  label: string;
  icon?: string;
  isFixed?: boolean;
};

type DropdownProps = {
  onChange: (tag: string) => string;
  isSearchable: boolean;
  isMulti: boolean;
  closeMenuOnSelect: boolean;
  value?: string;
  placeholder?: string;
  options: DropdownOptions[];
  formatLabel?: boolean;
  isDisabled?: boolean;
};

const optionsKnown: DropdownOptions[] = [
  { label: 'Investigate', icon: 'investigate' },
  { label: 'Do not Investigate', icon: 'not_investigate' },
  { label: 'Postpone', icon: 'postpone' },
];

const optionsUnknown: DropdownOptions[] = [
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

export const formatOptionLabel = (props: DropdownOptions) => {
  const { label, icon } = props;
  return (
    <div className="select-row">
      <i className={`select ${icon}`} />
      <span>{label}</span>
    </div>
  );
};

export const Dropdown = (props: DropdownProps) => {
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
  } = props;

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
};

Dropdown.defaultProps = {
  placeholder: 'Select a tag',
  isMulti: false,
  isSearchable: false,
  closeMenuOnSelect: true,
  options: filterOptions,
  formatLabel: true,
  isDisabled: false,
};

Dropdown.propTypes = {
  onChange: propTypes.func,
  placeholder: propTypes.string,
  isMulti: propTypes.bool,
  isSearchable: propTypes.bool,
  closeMenuOnSelect: propTypes.bool,
  options: propTypes.array,
};

export default Dropdown;
