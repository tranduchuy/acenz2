import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";
import { Banner, Button, PasswordField, TextField } from "@acenz/ui";
import { register } from "../api/auth";
import { registerErrorMessage, type RegisterField } from "../auth/register-messages";
import { validateRegister, type RegisterErrors } from "../auth/register-validation";
import { AuthLayout } from "../components/AuthLayout";

type Status = "idle" | "submitting" | "success";

const TAGLINE = "Bắt đầu hành trình IELTS của bạn.";
const EMPTY: Record<RegisterField, string> = { name: "", email: "", phone: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string>();
  // A ref, not state: two submits in the same tick (Enter + click) both see the state from before the first.
  const inFlight = useRef(false);

  const locked = status !== "idle";

  /** Props shared by every field: controlled value, clears that field's error on edit, locked while submitting. */
  const bind = (field: RegisterField) => ({
    name: field,
    value: values[field],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (fieldErrors[field]) setFieldErrors((fe) => ({ ...fe, [field]: undefined }));
    },
    error: fieldErrors[field],
    disabled: locked,
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current || status === "success") return;

    // Same checks as the server, so every problem shows at once and nothing is sent until the form is valid.
    const problems = validateRegister(values);
    setFormError(undefined);
    if (Object.keys(problems).length > 0) {
      setFieldErrors(problems);
      return;
    }

    inFlight.current = true;
    setFieldErrors({});
    setStatus("submitting");

    const result = await register(values);
    inFlight.current = false;
    if (result.ok) {
      // Token storage and redirects are out of scope (AZ-58); the token is not kept.
      setStatus("success");
      return;
    }
    const { field, message } = registerErrorMessage(result.code);
    if (field === "form") setFormError(message);
    else setFieldErrors({ [field]: message });
    setStatus("idle");
  }

  return (
    <AuthLayout tagline={TAGLINE} brandPanelTestId="register-brand-panel">
      <div className="flex flex-col gap-1 lg:gap-2">
        <h1 className="m-0 text-h1">Tạo tài khoản</h1>
        <p className="m-0 hidden text-body text-ink-muted lg:block">Điền thông tin bên dưới để bắt đầu học.</p>
      </div>

      <form
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-3 lg:gap-4 lg:rounded-lg lg:border lg:border-line lg:bg-surface-raised lg:p-8 lg:shadow-sm"
      >
        {formError && (
          <div data-testid="register-form-error">
            <Banner tone="danger">{formError}</Banner>
          </div>
        )}
        {status === "success" && (
          <div data-testid="register-success">
            <Banner tone="success">Đăng ký thành công.</Banner>
          </div>
        )}
        <TextField label="Họ và tên" autoComplete="name" placeholder="Nguyễn Văn A" {...bind("name")} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ban@email.com"
          {...bind("email")}
        />
        <TextField label="Số điện thoại" autoComplete="tel" inputMode="tel" placeholder="0901234567" {...bind("phone")} />
        <PasswordField label="Mật khẩu" autoComplete="new-password" placeholder="Tạo mật khẩu" {...bind("password")} />
        <PasswordField
          label="Xác nhận mật khẩu"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          {...bind("confirmPassword")}
        />
        <Button variant="primary" type="submit" disabled={locked} className="mt-2 h-12 w-full justify-center">
          Tạo tài khoản
        </Button>
      </form>

      <p className="m-0 text-center text-body-sm text-ink-muted">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-medium text-brand hover:text-brand-hover">
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
