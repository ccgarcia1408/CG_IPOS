import { ApiError } from "../../services/api";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import SearchableSelect from "../form/SearchableSelect";
import { login as loginRequest, selectBranch as selectBranchRequest } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { LoginBranchOption, LoginTenantOption } from "../../types/Response";

export default function SignInForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // BRANCH SELECTION STEP (non-admin users only; Administrator skips this entirely)
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [tenantOptions, setTenantOptions] = useState<LoginTenantOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<LoginBranchOption[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const filteredBranchOptions = useMemo(
    () =>
      selectedTenantId
        ? branchOptions.filter((branch) => String(branch.TenantId) === selectedTenantId)
        : branchOptions,
    [branchOptions, selectedTenantId]
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;  

    if (!username.trim()) {
      toast.error("Username is required.", {
        id: "login-error",
      });
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required.", {
        id: "login-error",
      });
      return;
    }

    setLoading(true);

    try {
      setLoading(true);

      const result = await loginRequest({
        Username: username.trim(),
        Password: password,
      });

      if (result?.data?.requiresBranchSelection) {
        setPendingToken(result.data.pendingToken ?? null);
        setTenantOptions(result.data.tenants ?? []);
        setBranchOptions(result.data.branches ?? []);
        setSelectedTenantId("");
        setSelectedBranchId("");
        return;
      }

      const token = result?.token || result?.data?.token;
      const user = result?.data?.user ?? null;

      if (!token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      login({ token, user });

      navigate("/dashboard", { replace: true });

      toast.success("Login successful!", {
        id: "login-success",
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message, {
          id: "login-error",
        });
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message, {
          id: "login-error",
        });
        return;
      }

      toast.error("Something went wrong.", {
        id: "login-error",
      });

    } finally {
      setLoading(false);
    };
  }

  const handleSelectBranch = async () => {
    if (!pendingToken) return;

    if (!selectedTenantId || !selectedBranchId) {
      toast.error("Please select a tenant and branch.", {
        id: "login-error",
      });
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const result = await selectBranchRequest(
        pendingToken,
        Number(selectedTenantId),
        Number(selectedBranchId)
      );

      const token = result?.token || result?.data?.token;
      const user = result?.data?.user ?? null;

      if (!token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      login({ token, user });

      navigate("/dashboard", { replace: true });

      toast.success("Login successful!", {
        id: "login-success",
      });
    } catch (error: unknown) {
      if (error instanceof ApiError || error instanceof Error) {
        toast.error(error.message, {
          id: "login-error",
        });
        return;
      }

      toast.error("Something went wrong.", {
        id: "login-error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (pendingToken) {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Select Branch
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose which tenant and branch you're working at for this session.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>
                  Tenant <span className="text-error-500">*</span>
                </Label>
                <SearchableSelect
                  placeholder="Select a tenant..."
                  value={selectedTenantId}
                  onChange={(value) => {
                    setSelectedTenantId(value);
                    setSelectedBranchId("");
                  }}
                  options={tenantOptions.map((tenant) => ({
                    value: String(tenant.TenantId),
                    label: tenant.TenantName,
                  }))}
                />
              </div>

              <div>
                <Label>
                  Branch <span className="text-error-500">*</span>
                </Label>
                <SearchableSelect
                  placeholder={selectedTenantId ? "Select a branch..." : "Select a tenant first"}
                  disabled={!selectedTenantId}
                  value={selectedBranchId}
                  onChange={setSelectedBranchId}
                  options={filteredBranchOptions.map((branch) => ({
                    value: String(branch.BranchId),
                    label: branch.BranchName,
                  }))}
                />
              </div>

              <div>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={handleSelectBranch}
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Continue"}
                </Button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPendingToken(null);
                  setTenantOptions([]);
                  setBranchOptions([]);
                }}
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign-in
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username and password to sign in.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">

                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUsername(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Button
                    className="w-full"
                    size="sm"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
