import { useRef, useState, type FormEvent } from "react";
import { Banner, Button, Icon, PasswordField, TextField, type IconName } from "@acenz/ui";
import { login } from "../api/auth";
import { loginErrorMessage } from "../auth/login-messages";
import logoWhite from "../assets/logo-white.png";

type FieldErrors = { email?: string; password?: string };
type Status = "idle" | "submitting" | "success";

const TAGLINE = "Học IELTS mỗi ngày, tiến bộ từng band.";
const FEATURES: { icon: IconName; text: string }[] = [
  { icon: "send", text: "Nộp bài Writing, Speaking ngay trên web" },
  { icon: "message", text: "Xem nhận xét và Band theo từng tiêu chí" },
  { icon: "calendar", text: "Theo dõi lịch học và thông báo của lớp" },
];

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
    <div className="min-h-dvh bg-surface font-sans text-ink lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Desktop brand panel */}
      <aside className="hidden flex-col justify-between gap-10 bg-brand px-12 pt-12 pb-10 text-on-brand lg:flex" data-testid="login-brand-panel">
        <img src={logoWhite} alt="ACENZ" className="h-11 w-auto self-start dark:invert" />
        <div className="flex max-w-[480px] flex-col gap-8">
          <h2 className="m-0 text-display">{TAGLINE}</h2>
          <ul className="m-0 flex list-none flex-col gap-4 p-0 text-body">
            {FEATURES.map((f) => (
              <li key={f.icon} className="flex items-center gap-3">
                <Icon name={f.icon} />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="m-0 text-body-sm">© 2026 ACENZ</p>
      </aside>

      <div className="flex min-h-dvh flex-col lg:min-h-0">
        {/* Mobile header band */}
        <header className="flex flex-col gap-4 bg-brand px-6 pt-8 pb-6 text-on-brand lg:hidden">
          <img src={logoWhite} alt="ACENZ" className="h-8 w-auto self-start dark:invert" />
          <p className="m-0 text-h2 font-extralight">{TAGLINE}</p>
        </header>

        <main className="flex flex-1 flex-col px-6 pt-6 pb-5 lg:items-center lg:justify-center lg:px-8 lg:py-10">
          <div className="flex w-full flex-col gap-5 lg:max-w-[420px] lg:gap-6">
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
          </div>
        </main>
      </div>
    </div>
  );
}
