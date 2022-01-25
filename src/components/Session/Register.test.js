import React from 'react';
import { renderWithStore, TestWrapper } from 'src/tests/utils';
import { Register } from './Register';

describe('Testing Register component', () => {
  const RegisterComponent = renderWithStore(
    {},
    <TestWrapper>
      <Register />
    </TestWrapper>,
  );
  it('Should Render witout crashing', () => {
    expect(RegisterComponent).toMatchSnapshot();
  });
});
