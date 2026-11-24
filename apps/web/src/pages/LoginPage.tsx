import { useRef, useState, type FormEvent } from "react";
import { Banner, Button, PasswordField, TextField } from "@acenz/ui";
import { login } from "../api/auth";
import { loginErrorMessage } from "../auth/login-messages";
import { AuthLayout } from "../components/AuthLayout";

type FieldErrors = { email?: string; password?: string };
type Status = "idle" | "submitting" | "success";

const TAGLINE = "Học IELTS mỗi ngày, tiến bộ từng band.";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  // A ref, not state: two submits in the same tick (Enter + click) both see the state from before the first.
  const inFlight = useRef(false);

  const locked = status !== "idle";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current || status === "success") return;
    inFlight.current = true;
    setFieldErrors({});
    setFormError(undefined);
    setStatus("submitting");

    const result = await login(email, password);
    inFlight.current = false;
    if (result.ok) {
      // Token storage and redirects are out of scope (AZ-57); the token is not kept.
      setStatus("success");
      return;
    }
    const { field, message } = loginErrorMessage(result.code);
    if (field === "form") setFormError(message);
    else setFieldErrors({ [field]: message });
    setStatus("idle");
  }

  return (
    <AuthLayout tagline={TAGLINE} brandPanelTestId="login-brand-panel">
      <div className="flex flex-col gap-1 lg:gap-2">
        <h1 className="m-0 text-h1">Đăng nhập</h1>
        <p className="m-0 text-body text-ink-muted">
          Chào mừng bạn quay lại.<span className="hidden lg:inline"> Đăng nhập để vào lớp học của bạn.</span>
        </p>
      </div>

      <form
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-3 lg:gap-4 lg:rounded-lg lg:border lg:border-line lg:bg-surface-raised lg:p-8 lg:shadow-sm"
      >
        {formError && (
          <div data-testid="login-form-error">
            <Banner tone="danger">{formError}</Banner>
          </div>
        )}
        {status === "success" && (
          <div data-testid="login-success">
            <Banner tone="success">Đăng nhập thành công.</Banner>
          </div>
        )}
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ban@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((fe) => ({ ...fe, email: undefined }));
          }}
          error={fieldErrors.email}
          disabled={locked}
        />
        <PasswordField
          label="Mật khẩu"
          name="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((fe) => ({ ...fe, password: undefined }));
          }}
          error={fieldErrors.password}
          disabled={locked}
        />
        <Button variant="primary" type="submit" disabled={locked} className="mt-2 h-12 w-full justify-center">
          Đăng nhập
        </Button>
      </form>
    </AuthLayout>
  );
}
