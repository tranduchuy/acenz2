import { Link } from "react-router";

interface AuthSwitchLinkProps {
  /** Question before the link, e.g. "Đã có tài khoản?". */
  prompt: string;
  to: string;
  /** Link text, e.g. "Đăng nhập". */
  label: string;
}

/** Line under a sign-in form that leads to the other sign-in page. */
export function AuthSwitchLink({ prompt, to, label }: AuthSwitchLinkProps) {
  return (
    <p className="m-0 text-center text-body-sm text-ink-muted">
      {prompt}{" "}
      <Link to={to} className="font-medium text-brand hover:text-brand-hover">
        {label}
      </Link>
    </p>
  );
}
