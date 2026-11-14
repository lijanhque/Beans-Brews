"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({
  mode,
  callbackURL = "/profile",
  adminMode = false,
}: {
  mode: "login" | "signup";
  callbackURL?: string;
  adminMode?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = isSignup
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message ?? "We couldn't sign you in. Please try again.");
        return;
      }

      router.push(callbackURL.startsWith("/") && !callbackURL.startsWith("//") ? callbackURL : "/profile");
      router.refresh();
    } catch {
      setError("We couldn't reach the sign-in service. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-card">
      <span className="eyebrow">{adminMode ? "STAFF ONLY · ADMIN" : isSignup ? "A SEAT AT OUR TABLE" : "WELCOME BACK"}</span>
      <h1>{adminMode ? "Welcome to your workspace." : isSignup ? "Make yourself at home." : "Good to see you."}</h1>
      <p>
        {adminMode
          ? "Sign in with your administrator account to continue."
          : isSignup
          ? "Create an account to keep your favorite things close."
          : "Sign in to pick up right where you left off."}
      </p>
      <form className="auth-fields" onSubmit={submit}>
        {isSignup && (
          <label>
            Your name
            <input
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
        )}
        <label>
          Email address
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button-dark auth-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? "One moment…" : isSignup ? "Create account" : "Log in"}
        </button>
      </form>
      {!adminMode && (
        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New around here?"}{" "}
          <Link href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      )}
    </section>
  );
}
