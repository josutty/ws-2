import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@test/test-utils';
import { server } from '@mocks/node';
import { scenarios } from '@mocks/scenarios';
import { apiUrl } from '@mocks/lib';
import { DEALER_CODE, DEMO_PASSWORD } from '@mocks/constants';
import { currentCyclePreviewFixture } from '@mocks/fixtures/cyclePreview';
import { currentUserFixture } from '@mocks/fixtures/currentUser';
import { LoginForm } from './LoginForm';

const fillAndSubmit = async (
  user: ReturnType<typeof renderWithProviders>['user'],
  identifier: string,
  password: string,
) => {
  await user.type(screen.getByLabelText('Dealer code or email'), identifier);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
};

describe('LoginForm', () => {
  it('renders both fields with labels and no errors', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText('Dealer code or email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Sign in with VECVNet SSO' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('submits valid credentials and clears the loading state on success', async () => {
    const { user } = renderWithProviders(<LoginForm />);
    await fillAndSubmit(user, DEALER_CODE, DEMO_PASSWORD);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the identifier field error for an unrecognised dealer code', async () => {
    server.use(...scenarios.loginUnknownIdentifier);
    const { user } = renderWithProviders(<LoginForm />);
    await fillAndSubmit(user, 'unknown-dealer', DEMO_PASSWORD);
    expect(await screen.findByText("We don't recognise that dealer code.")).toBeInTheDocument();
    expect(screen.getByLabelText('Dealer code or email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the password field error for a wrong password', async () => {
    server.use(...scenarios.loginWrongPassword);
    const { user } = renderWithProviders(<LoginForm />);
    await fillAndSubmit(user, DEALER_CODE, 'wrong-pass');
    expect(await screen.findByText('Incorrect password. 4 attempts left before the account locks.')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables and shows loading on the submit button while the mutation is in flight', async () => {
    server.use(http.post(apiUrl('/auth/login'), async () => {
      await delay('infinite');
      return HttpResponse.json({ accessToken: 'mock-access-token', user: currentUserFixture });
    }));
    const { user } = renderWithProviders(<LoginForm />);
    await user.type(screen.getByLabelText('Dealer code or email'), DEALER_CODE);
    await user.type(screen.getByLabelText('Password'), DEMO_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });

  it('shows a form-level banner on a server error', async () => {
    server.use(...scenarios.loginServerError);
    const { user } = renderWithProviders(<LoginForm />);
    await fillAndSubmit(user, DEALER_CODE, DEMO_PASSWORD);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Sign-in is unavailable right now.');
  });

  it('hides the cycle banner silently but keeps the form usable when it fails to load', async () => {
    server.use(...scenarios.cyclePreviewServerError);
    renderWithProviders(<LoginForm />);
    await waitFor(() => expect(screen.queryByText(currentCyclePreviewFixture.cycleLabel)).not.toBeInTheDocument());
    expect(screen.getByLabelText('Dealer code or email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
