import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/auth-form";
import { BetaEmailSignupNotice } from "@/components/beta-email-signup-notice";
export default function SignUpPage(){return <AuthShell mode="sign-up"><BetaEmailSignupNotice/><SignUpForm/></AuthShell>}
