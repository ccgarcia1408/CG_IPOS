import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import Modal from "../ui/modal/Modal";
import { ApiError } from "../../services/api";
import { requestPasswordReset, resetPassword, verifyResetCode } from "../../services/auth";

const RESEND_COOLDOWN_SECONDS = 60;

type Step = "EMAIL" | "CODE";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error ? error.message : fallback;

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isNewPasswordOpen, setIsNewPasswordOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Magic-link landing: ?email=...&code=... from the reset email button. Auto-verify so the
  // user goes straight to the new-password step without retyping the code.
  useEffect(() => {
    const linkEmail = searchParams.get("email");
    const linkCode = searchParams.get("code");
    if (!linkEmail || !linkCode) return;

    setEmail(linkEmail);
    setCode(linkCode);
    setStep("CODE");

    verifyResetCode(linkEmail, linkCode)
      .then(() => setIsNewPasswordOpen(true))
      .catch((error: unknown) =>
        toast.error(getErrorMessage(error, "That link has expired. Enter the code manually or resend it below."))
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendCode = async (targetEmail: string) => {
    await requestPasswordReset(targetEmail);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleRequestCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      toast.error("Email is required.", { id: "forgot-password-error" });
      return;
    }

    setLoading(true);
    try {
      await sendCode(email.trim());
      toast.success("A reset code has been sent to your email.", { id: "forgot-password-success" });
      setStep("CODE");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send reset code."), { id: "forgot-password-error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;

    setLoading(true);
    try {
      await sendCode(email);
      toast.success("A new reset code has been sent to your email.", { id: "forgot-password-success" });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to resend reset code."), { id: "forgot-password-error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (code.trim().length !== 6) {
      toast.error("Enter the 6-digit code from your email.", { id: "forgot-password-error" });
      return;
    }

    setLoading(true);
    try {
      await verifyResetCode(email, code.trim());
      setIsNewPasswordOpen(true);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Invalid or expired code."), { id: "forgot-password-error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async () => {
    if (savingPassword) return;

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.", { id: "reset-password-error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.", { id: "reset-password-error" });
      return;
    }

    setSavingPassword(true);
    try {
      await resetPassword(email, code.trim(), newPassword);
      setIsNewPasswordOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setIsSuccessOpen(true);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to reset password."), { id: "reset-password-error" });
      setIsNewPasswordOpen(false);
    } finally {
      setSavingPassword(false);
    }
  };

  useEffect(() => {
    if (!isSuccessOpen) return;
    const timer = setTimeout(() => navigate("/login", { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [isSuccessOpen, navigate]);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === "EMAIL"
                ? "Enter your email to reset your password!"
                : `Enter the 6-digit code sent to ${email}.`}
            </p>
          </div>

          {step === "EMAIL" ? (
            <form onSubmit={handleRequestCode}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Reset Password"}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Reset Code <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    type="text"
                    placeholder="6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center text-sm dark:bg-white/[0.03]">
                  <p className="text-gray-600 dark:text-gray-400">Didn&apos;t receive the email?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="mt-1 font-medium text-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:text-gray-400 dark:text-brand-400"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("EMAIL");
                    setCode("");
                  }}
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-center mt-6">
            <div className="flex items-center gap-3">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Return to {""}
                <Link to="/login" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isNewPasswordOpen}
        title="Create New Password"
        onClose={() => setIsNewPasswordOpen(false)}
        onConfirm={handleSetNewPassword}
        confirmText="Save Password"
        loading={savingPassword}
        width="sm"
      >
        <div className="space-y-4">
          <div>
            <Label>
              New Password <span className="text-error-500">*</span>{" "}
            </Label>
            <Input
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>
              Confirm Password <span className="text-error-500">*</span>{" "}
            </Label>
            <Input
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isSuccessOpen}
        title="Password Changed"
        onClose={() => navigate("/login", { replace: true })}
        onConfirm={() => navigate("/login", { replace: true })}
        confirmText="Go to Login"
        hideFooter={false}
        width="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Your password has been changed successfully. You&apos;ll be redirected to the login page shortly.
        </p>
      </Modal>
    </div>
  );
}
