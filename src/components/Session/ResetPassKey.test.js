import React from 'react';
import { renderWithStore, TestWrapper } from 'src/tests/utils';
import ResetPasskey from './ResetPasskey';

describe('Testing Reset password component', () => {
  const resetPassword = renderWithStore(
    {},
    <TestWrapper>
      <ResetPasskey />
    </TestWrapper>,
  );
  it('Should render without crashing', () => {
    expect(resetPassword).toMatchSnapshot();
  });
});
