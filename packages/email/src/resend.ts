import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/** @deprecated Use getResend() instead */
export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    const instance = getResend();
    const value = instance[prop as keyof Resend];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
