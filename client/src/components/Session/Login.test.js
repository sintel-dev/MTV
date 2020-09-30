import React from 'react';
import { TestWrapper, renderWithStore } from 'src/tests/utils';
import { Login } from './Login';

describe('Testing Login component ->', () => {
  const LoginComponent = renderWithStore(
    {},
    <TestWrapper>
      <Login loginStatus="unauthenticated" />
    </TestWrapper>,
  );
  it('Should render without crashing', () => {
    expect(LoginComponent).toMatchSnapshot();
  });
});
