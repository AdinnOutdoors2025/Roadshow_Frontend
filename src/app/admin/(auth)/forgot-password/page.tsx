import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adinn Roadshow Admin - Forgot Password",
  description: "",
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
