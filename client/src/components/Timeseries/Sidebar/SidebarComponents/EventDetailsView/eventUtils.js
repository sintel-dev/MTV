import { grouppedOptions } from 'src/components/Common/Dropdown';

export const selectedOption = (selectedLabel) =>
  selectedLabel === null || selectedLabel === 'Untagged'
    ? 'Select a tag'
    : grouppedOptions
        .reduce((known, unknown) => [...known.options, ...unknown.options])
        .find(({ label }) => label === selectedLabel);
