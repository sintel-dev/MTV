import React from 'react';
import Select, { components } from 'react-select';
import { CloseIcon } from 'src/components/Common/icons';
import { DropdownArrow } from '../icons/icons';
import './SelectDropdown.scss';

const dummyOptions = [
  { value: 'ocean', label: 'Ocean', color: '#00B8D9' },
  { value: 'purple', label: 'Purple', color: '#5243AA' },
  { value: 'red', label: 'Red', color: '#FF5630' },
  { value: 'orange', label: 'Orange', color: '#FF8B00' },
  { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  { value: 'green', label: 'Green', color: '#36B37E' },
  { value: 'forest', label: 'Forest', color: '#00875A' },
  { value: 'slate', label: 'Slate', color: '#253858' },
  { value: 'silver', label: 'Silver', color: '#666666' },
];

const ClearIndicator = (dropdownProps) => (
  <components.ClearIndicator {...dropdownProps}>
    <CloseIcon />
  </components.ClearIndicator>
);

const DropdownIndicator = (dropdownProps) => {
  const direction = dropdownProps.selectProps.menuIsOpen ? 'up' : 'down';
  return <components.DropdownIndicator {...dropdownProps}>{DropdownArrow(direction)}</components.DropdownIndicator>;
};

const ValueContainer = ({ children, getValue, ...props }) => {
  let { length } = getValue();

  return (
    <components.ValueContainer {...props}>
      <ul>
        <li>Selected items</li>
        <li className="filter">{length}</li>
      </ul>
      {React.Children.map(children, (child) => (child.type === components.Input ? child : null))}
    </components.ValueContainer>
  );
};

const SelectDropDown = (selectProps) => {
  const {
    labelValue = 'Default Select',
    placeholder = 'Please select',
    onSelect,
    isMulti = false,
    isDisabled = false,
    closeOnSelect = true,
    enableCounter = false,
    options = dummyOptions,
  } = selectProps;

  const formatOptionLabel = (dropdownProps) => {
    const { label } = dropdownProps;

    return isMulti ? (
      <div className="select-row">
        <i className="checkbox" />
        <span>{label}</span>
      </div>
    ) : (
      <div className="select-row">
        <span>{label}</span>
      </div>
    );
  };

  const disabledClassName = isDisabled ? 'disabled' : '';

  let customComponents = {
    DropdownIndicator,
    ClearIndicator,
  };

  enableCounter && Object.assign(customComponents, { ValueContainer });

  return (
    <div className={`select-dropdown ${disabledClassName}`}>
      <label>{labelValue}</label>
      <Select
        isMulti={isMulti}
        name="colors"
        options={options}
        hideSelectedOptions={false}
        className="mtv-dropdown"
        classNamePrefix="mtv-dropdown"
        components={customComponents}
        onChange={onSelect}
        isDisabled={isDisabled}
        formatOptionLabel={formatOptionLabel}
        placeholder={placeholder}
        closeMenuOnSelect={closeOnSelect}
      />
    </div>
  );
};

export default SelectDropDown;
