"use client";

import { forwardRef } from "react";

interface LoginFormProps {
  isConnected: boolean;
  onLogin: () => void;
  className?: string;
}

const LoginForm = forwardRef<HTMLDivElement, LoginFormProps>(
  ({ isConnected, onLogin, className = "" }, ref) => {
    return (
      <div ref={ref} className={`w-full transition-opacity ${className}`}>
        <button
          onClick={onLogin}
          disabled={isConnected}
          className="w-full bg-primary text-white font-semibold text-md py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnected ? "Connected" : "Login"}
        </button>
        <p className="text-center text-text/50 text-xs mt-3 leading-relaxed">
          By signing in, you agree to the{" "}
          <a
            href="#"
            className="underline hover:text-text/70 transition-colors"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="underline hover:text-text/70 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    );
  }
);

LoginForm.displayName = "LoginForm";

export default LoginForm;
