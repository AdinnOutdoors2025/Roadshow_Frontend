/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
    ClipboardEvent,
    KeyboardEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import "./ClientAuthModal.css";
import { baseUrl } from "@/BaseUrl";
type AuthFlow = "login" | "signup";

const OTP_LENGTH = 6;
const RESEND_TIME = 30;

export default function ClientAuthModal() {
    const {
        open,
        screen,
        setScreen,
        closeAuth,
        loginUser,
    } = useAuth();

    const [authFlow, setAuthFlow] = useState<AuthFlow>("login");

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("7092558277");
    const [email, setEmail] = useState("");
    const [resendTimer, setResendTimer] = useState(RESEND_TIME);
    const [otpDigits, setOtpDigits] = useState<string[]>(
        Array(OTP_LENGTH).fill("")
    );

    const [otpError, setOtpError] = useState(false);
    const [otpErrorMessage, setOtpErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        if (screen === "login" || screen === "signup") {
            setAuthFlow(screen);
            setOtpDigits(Array(OTP_LENGTH).fill(""));
            setOtpError(false);
            setOtpErrorMessage("");
        }
    }, [screen]);

    useEffect(() => {
        if (!open) {
            setOtpDigits(Array(OTP_LENGTH).fill(""));
            setOtpError(false);
            setOtpErrorMessage("");
            setLoading(false);
        }
    }, [open]);
    useEffect(() => {
        if (screen !== "otp" || resendTimer <= 0) {
            return;
        }

        const timerId = window.setTimeout(() => {
            setResendTimer((previousTime) =>
                Math.max(previousTime - 1, 0)
            );
        }, 1000);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [screen, resendTimer]);

    useScrollLock(open);

    if (!open) return null;

    const getErrorMessage = (
        error: unknown,
        fallbackMessage: string
    ): string => {
        if (axios.isAxiosError(error)) {
            return error.response?.data?.message || fallbackMessage;
        }

        return fallbackMessage;
    };

    const showValidationError = (message: string) => {
        toast.error(message, {
            id: "client-auth-validation",
        });
    };

    const validateBeforeOtp = (flow: AuthFlow): boolean => {
        const cleanPhone = phone.replace(/\D/g, "");

        if (flow === "signup" && !name.trim()) {
            showValidationError("Please enter your full name.");
            return false;
        }

        if (!cleanPhone) {
            showValidationError("Please enter your mobile number.");
            return false;
        }

        if (cleanPhone.length !== 10) {
            showValidationError(
                "Please enter a valid 10-digit mobile number."
            );
            return false;
        }

        if (flow === "signup" && !email.trim()) {
            showValidationError("Please enter your email address.");
            return false;
        }

        if (
            flow === "signup" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            showValidationError("Please enter a valid email address.");
            return false;
        }

        return true;
    };

    const sendOtp = async (
        requestedFlow?: AuthFlow,
        isResend = false
    ) => {
        const currentFlow: AuthFlow =
            requestedFlow ||
            (screen === "login"
                ? "login"
                : screen === "signup"
                    ? "signup"
                    : authFlow);

        if (!validateBeforeOtp(currentFlow)) return;

        const loadingToastId = toast.loading(
            isResend ? "Resending OTP..." : "Sending OTP..."
        );

        try {
            setLoading(true);
            setOtpError(false);
            setOtpErrorMessage("");
            setAuthFlow(currentFlow);

            const mode =
                currentFlow === "signup" ? "register" : "login";

            await axios.post(
                `${baseUrl}/api/client-auth/send-otp`,
                {
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.replace(/\D/g, ""),
                    mode,
                }
            );

            setOtpDigits(Array(OTP_LENGTH).fill(""));
            setResendTimer(RESEND_TIME);
            setScreen("otp");

            toast.success(
                isResend
                    ? "OTP resent successfully."
                    : "OTP sent successfully.",
                {
                    id: loadingToastId,
                }
            );

            window.setTimeout(() => {
                otpInputRefs.current[0]?.focus();
            }, 100);
        } catch (error: unknown) {
            const message = getErrorMessage(
                error,
                isResend
                    ? "Failed to resend OTP."
                    : "Failed to send OTP."
            );

            toast.error(message, {
                id: loadingToastId,
            });
        } finally {
            setLoading(false);
        }
    };
    const handleResendOtp = async () => {
        if (loading || resendTimer > 0) {
            return;
        }

        await sendOtp(authFlow, true);
    };
    const verifyOtp = async () => {
        const otp = otpDigits.join("");

        if (otp.length !== OTP_LENGTH) {
            const message =
                "Please enter the complete 6-digit OTP.";

            setOtpError(true);
            setOtpErrorMessage(message);

            toast.error(message, {
                id: "client-auth-otp-error",
            });

            const firstEmptyIndex = otpDigits.findIndex(
                (digit) => !digit
            );

            otpInputRefs.current[
                firstEmptyIndex === -1 ? 0 : firstEmptyIndex
            ]?.focus();

            return;
        }

        const loadingToastId = toast.loading(
            "Verifying OTP..."
        );

        try {
            setLoading(true);
            setOtpError(false);
            setOtpErrorMessage("");

            const response = await axios.post(
                `${baseUrl}/api/client-auth/verify-otp`,
                {
                    phone: phone.replace(/\D/g, ""),
                    otp,
                }
            );

            setOtpDigits(Array(OTP_LENGTH).fill(""));
            setOtpError(false);
            setOtpErrorMessage("");

            toast.success(
                authFlow === "signup"
                    ? "Account verified successfully."
                    : "Logged in successfully.",
                {
                    id: loadingToastId,
                }
            );

            loginUser(
                response.data.user,
                response.data.token
            );
        } catch (error: unknown) {
            const message = getErrorMessage(
                error,
                "Invalid OTP. Please try again."
            );

            setOtpError(true);
            setOtpErrorMessage(message);

            toast.error(message, {
                id: loadingToastId,
            });

            otpInputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const changeScreen = (nextScreen: AuthFlow) => {
        toast.dismiss();

        setAuthFlow(nextScreen);
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setOtpError(false);
        setOtpErrorMessage("");
        setResendTimer(RESEND_TIME);
        setScreen(nextScreen);
    };

    const handleCloseAuth = () => {
        toast.dismiss();

        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setOtpError(false);
        setOtpErrorMessage("");
        setResendTimer(RESEND_TIME);
        setLoading(false);

        closeAuth();
    };

    const handleOtpChange = (
        index: number,
        value: string
    ) => {
        const digit = value
            .replace(/\D/g, "")
            .slice(-1);

        const updatedOtp = [...otpDigits];
        updatedOtp[index] = digit;

        setOtpDigits(updatedOtp);
        setOtpError(false);
        setOtpErrorMessage("");

        toast.dismiss("client-auth-otp-error");

        if (digit && index < OTP_LENGTH - 1) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (
        event: KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (event.key === "Backspace") {
            event.preventDefault();

            const updatedOtp = [...otpDigits];

            if (updatedOtp[index]) {
                updatedOtp[index] = "";
                setOtpDigits(updatedOtp);
            } else if (index > 0) {
                updatedOtp[index - 1] = "";
                setOtpDigits(updatedOtp);

                otpInputRefs.current[index - 1]?.focus();
            }

            setOtpError(false);
            setOtpErrorMessage("");
            toast.dismiss("client-auth-otp-error");
        }

        if (event.key === "ArrowLeft" && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }

        if (
            event.key === "ArrowRight" &&
            index < OTP_LENGTH - 1
        ) {
            otpInputRefs.current[index + 1]?.focus();
        }

        if (event.key === "Enter") {
            verifyOtp();
        }
    };

    const handleOtpPaste = (
        event: ClipboardEvent<HTMLInputElement>
    ) => {
        event.preventDefault();

        const pastedDigits = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH)
            .split("");

        if (!pastedDigits.length) return;

        const updatedOtp =
            Array(OTP_LENGTH).fill("");

        pastedDigits.forEach((digit, index) => {
            updatedOtp[index] = digit;
        });

        setOtpDigits(updatedOtp);
        setOtpError(false);
        setOtpErrorMessage("");

        toast.dismiss("client-auth-otp-error");

        const focusIndex = Math.min(
            pastedDigits.length,
            OTP_LENGTH - 1
        );

        otpInputRefs.current[focusIndex]?.focus();
    };

    const handleOverlayClick = (
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        if (event.target === event.currentTarget) {
            handleCloseAuth();
        }
    };

    return (
        <div
            className="client-auth-overlay"
            onClick={handleOverlayClick}
        >
            <section
                className="client-auth-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="client-auth-title"
            >
                <button
                    type="button"
                    className="client-auth-close"
                    onClick={handleCloseAuth}
                    aria-label="Close authentication popup"
                >
                    <i className="fa-solid fa-x"></i>
                    {/* × */}
                </button>

                <div className="client-auth-left">
                    <div className="client-auth-logo">
                        <Image
                            src="/images/assets/Roadshow_AdinnLogo.png"
                            alt="Adinn Advertising Services Limited"
                            width={150}
                            height={50}
                            priority
                        />
                    </div>

                    <div className="client-auth-content">
                        {screen === "login" && (
                            <>
                                <h2
                                    id="client-auth-title"
                                    className="client-auth-title"
                                >
                                    Log In
                                </h2>

                                <div className="client-auth-fields">
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        placeholder="Mobile Number"
                                        value={phone}
                                        maxLength={10}
                                        disabled={loading}
                                        onChange={(event) => {
                                            setPhone(
                                                event.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 10)
                                            );

                                            toast.dismiss(
                                                "client-auth-validation"
                                            );
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" &&
                                                !loading
                                            ) {
                                                sendOtp("login");
                                            }
                                        }}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="client-auth-continue"
                                    onClick={() => sendOtp("login")}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Sending OTP..."
                                        : "Continue"}
                                </button>

                                <p className="client-auth-switch">
                                    Don&apos;t have an account?

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeScreen("signup")
                                        }
                                        disabled={loading}
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            </>
                        )}

                        {screen === "signup" && (
                            <>
                                <h2
                                    id="client-auth-title"
                                    className="client-auth-title"
                                >
                                    Sign Up
                                </h2>

                                <div className="client-auth-fields">
                                    <input
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Full Name"
                                        value={name}
                                        disabled={loading}
                                        onChange={(event) => {
                                            setName(event.target.value);

                                            toast.dismiss(
                                                "client-auth-validation"
                                            );
                                        }}
                                    />

                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        placeholder="Mobile Number"
                                        value={phone}
                                        maxLength={10}
                                        disabled={loading}
                                        onChange={(event) => {
                                            setPhone(
                                                event.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 10)
                                            );

                                            toast.dismiss(
                                                "client-auth-validation"
                                            );
                                        }}
                                    />

                                    <input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="Email Address"
                                        value={email}
                                        disabled={loading}
                                        onChange={(event) => {
                                            setEmail(event.target.value);

                                            toast.dismiss(
                                                "client-auth-validation"
                                            );
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" &&
                                                !loading
                                            ) {
                                                sendOtp("signup");
                                            }
                                        }}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="client-auth-continue"
                                    onClick={() => sendOtp("signup")}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Sending OTP..."
                                        : "Continue"}
                                </button>

                                <p className="client-auth-switch">
                                    Already have an account?

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeScreen("login")
                                        }
                                        disabled={loading}
                                    >
                                        Sign In
                                    </button>
                                </p>
                            </>
                        )}

                        {screen === "otp" && (
                            <>
                                <h2
                                    id="client-auth-title"
                                    className="client-auth-title client-auth-otp-title"
                                >
                                    OTP
                                </h2>

                                <div className="client-auth-otp-information">
                                    <p>
                                        Enter the OTP sent to{" "}
                                        <strong>
                                            {phone.replace(/\D/g, "")}
                                        </strong>
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeScreen(
                                                authFlow === "signup"
                                                    ? "signup"
                                                    : "login"
                                            )
                                        }
                                        disabled={loading}
                                    >
                                        Change Number
                                    </button>
                                </div>

                                <div
                                    className={`client-auth-otp ${otpError ? "has-error" : ""
                                        }`}
                                >
                                    {otpDigits.map(
                                        (digit, index) => (
                                            <input
                                                key={index}
                                                ref={(element) => {
                                                    otpInputRefs.current[index] =
                                                        element;
                                                }}
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete={
                                                    index === 0
                                                        ? "one-time-code"
                                                        : "off"
                                                }
                                                maxLength={1}
                                                value={digit}
                                                disabled={loading}
                                                aria-label={`OTP digit ${index + 1
                                                    }`}
                                                onChange={(event) =>
                                                    handleOtpChange(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) =>
                                                    handleOtpKeyDown(
                                                        event,
                                                        index
                                                    )
                                                }
                                                onPaste={handleOtpPaste}
                                            />
                                        )
                                    )}
                                </div>

                                {otpErrorMessage && (
                                    <p className="client-auth-error">
                                        {otpErrorMessage}
                                    </p>
                                )}

                                <p className="client-auth-resend">
                                    Didn&apos;t receive the OTP? &nbsp;

                                    {resendTimer > 0 ? (
                                        <span className="client-auth-resend-timer">
                                            Resend OTP in {resendTimer}s
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                        >
                                            {loading ? "Resending..." : "Resend OTP"}
                                        </button>
                                    )}
                                </p>

                                <button
                                    type="button"
                                    className="client-auth-continue"
                                    onClick={verifyOtp}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Verifying..."
                                        : "Verify"}
                                </button>

                                <p className="client-auth-switch">
                                    {authFlow === "signup"
                                        ? "Already have an account?"
                                        : "Don’t have an account?"}

                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() =>
                                            changeScreen(
                                                authFlow === "signup"
                                                    ? "login"
                                                    : "signup"
                                            )
                                        }
                                    >
                                        {authFlow === "signup"
                                            ? "Sign In"
                                            : "Sign Up"}
                                    </button>
                                </p>
                            </>
                        )}

                        <footer className="client-auth-footer">
                            By continuing, you agree to Adinn
                            Roadshow&apos;s{" "}

                            <button type="button">
                                Terms
                            </button>

                            <span> &amp; </span>

                            <button type="button">
                                Privacy Policy
                            </button>
                        </footer>
                    </div>
                </div>

                <div className="client-auth-right">
                    <Image
                        src="/images/assets/Rdsw_LoginRightBanner.svg"
                        alt="Adinn LED roadshow vehicle"
                        fill
                        priority
                        sizes="(max-width: 760px) 0px, 55vw"
                        className="client-auth-banner"
                    />
                </div>
            </section>
        </div>
    );
}