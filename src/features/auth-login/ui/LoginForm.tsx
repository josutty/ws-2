import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getErrorMessage, type ApiError } from '@shared/api';
import { Button, Input, Toast } from '@shared/ui';
import { useGetCurrentCyclePreviewQuery } from '@entities/cycle';
import { useLoginMutation } from '../api/authApi';
import { loginSchema, type LoginFormValues } from '../lib/loginSchema';

const STUB_MESSAGE = 'Not available in this build.';

const isApiError = (err: unknown): err is ApiError =>
  typeof err === 'object' && err !== null && 'code' in err && 'message' in err;

const formatClosesAt = (closesAt: string) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(closesAt));

export function LoginForm() {
  const [stubMessage, setStubMessage] = useState<string | null>(null);
  const { data: cyclePreview } = useGetCurrentCyclePreviewQuery({});
  const [login, { isLoading }] = useLoginMutation();
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');
    try {
      await login(values).unwrap();
    } catch (err) {
      const apiError = isApiError(err) ? err : undefined;
      if (apiError?.code === 'ERR_UNKNOWN_IDENTIFIER') {
        setError('identifier', { message: apiError.message });
      } else if (apiError?.code === 'ERR_WRONG_PASSWORD') {
        setError('password', { message: apiError.message });
      } else {
        setError('root', { message: getErrorMessage(apiError) });
      }
    }
  });

  return (
    <div className="mx-auto flex max-w-[400px] flex-col gap-4 rounded-card border border-border bg-surface p-4 shadow-card">
      <div>
        <h1 className="text-heading-2 text-fg">Sign in</h1>
        <p className="text-body-sm text-fg-muted">
          Enter your dealer code or email and password to access your workbench.
        </p>
      </div>
      {cyclePreview ? (
        <p className="text-body-sm text-fg-muted">
          {cyclePreview.cycleLabel} · closes {formatClosesAt(cyclePreview.closesAt)}
        </p>
      ) : null}
      {errors.root?.message ? (
        <p role="alert" className="rounded-card border border-danger/30 bg-danger-soft px-4 py-2 text-body-sm text-danger">
          {errors.root.message}
        </p>
      ) : null}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <Controller
          name="identifier"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              id="identifier"
              label="Dealer code or email"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="username"
              disabled={isLoading}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              id="password"
              label="Password"
              type="password"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              autoComplete="current-password"
              disabled={isLoading}
            />
          )}
        />
        <Button type="submit" variant="primary" disabled={isLoading}>
          Sign in
        </Button>
        <Button type="button" variant="ghost" disabled={isLoading} onClick={() => setStubMessage(STUB_MESSAGE)}>
          Sign in with VECVNet SSO
        </Button>
      </form>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setStubMessage(STUB_MESSAGE)}
          className="text-left text-body-sm font-medium text-primary hover:underline"
        >
          Forgot password?
        </button>
        <p className="text-caption text-fg-subtle">Need help? Contact your ASM for support.</p>
      </div>
      <Toast message={stubMessage} />
    </div>
  );
}
