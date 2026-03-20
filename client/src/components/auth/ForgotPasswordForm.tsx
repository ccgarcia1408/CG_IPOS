// import { useState } from "react";
import { Link } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function ForgotPasswordForm() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email to reset your password!
            </p>
          </div>
          <div>
            <form>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input placeholder="email" />
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Reset Password
                  </Button>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                      Return to {""}
                      <Link
                        to="/login"
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        login
                      </Link>
                    </p>         
                  </div>
                </div> 
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
