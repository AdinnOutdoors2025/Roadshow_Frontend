import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adinn Roadshow Admin - Sign In",
  description: "",
};

export default function SignIn() {
  return <SignInForm />;
}
