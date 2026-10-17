/**
 * An e-mail address that wraps only after the "@" ("shitja@" / "example.com") when it does
 * not fit on one line, instead of breaking mid-word at the screen edge.
 */
export function EmailAddress({ email }: { readonly email: string }) {
  const at = email.indexOf('@');
  if (at < 0) return email;
  return (
    <>
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </>
  );
}
