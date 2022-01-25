import React from 'react';
import { renderWithStore, TestWrapper } from 'src/tests/utils';
import { Dropdown } from './Dropdown';

describe('Testing dropdown component', () => {
  it('Should render without crashing', () => {
    const dropdownComponent = renderWithStore(
      {},
      <TestWrapper>
        <Dropdown />
      </TestWrapper>,
    );
    expect(dropdownComponent).toMatchSnapshot();
  });
});
