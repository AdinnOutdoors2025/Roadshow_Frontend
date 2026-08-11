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
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import "./ClientAuthModal.css";
import AccountTypeStep, { ClientAccountType } from "./AccountTypeStep";
import GstVerifyPanel from "@/components/gst/GstVerifyPanel";
import { GstBusiness, isGstBlocked } from "@/lib/gst";
// Env-driven base URL — `@/BaseUrl` hardcodes localhost and breaks in production.
// import API_BASE from "../../../baseurl";
import { baseUrl } from "@/BaseUrl";

type AuthFlow = "login" | "signup";

const OTP_LENGTH = 6;
const RESEND_TIME = 30;

/** Screen slide/fade used between login → account type → form → OTP. */
const screenMotion = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export default function ClientAuthModal() {
    const {
        open,
        screen,
        setScreen,
        closeAuth,
        loginUser,
    } = useAuth();

    const [authFlow, setAuthFlow] = useState<AuthFlow>("login");

    /* Agency signup: one question, then GST does the rest of the typing */
    const [accountType, setAccountType] =
        useState<ClientAccountType | null>(null);
    const [gstNumber, setGstNumber] = useState("");
    const [gstBusiness, setGstBusiness] =
        useState<GstBusiness | null>(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
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
        if (screen === "login") {
            setAuthFlow("login");
        } else if (screen === "signup" || screen === "signupAgency") {
            setAuthFlow("signup");
        }

        if (screen !== "otp") {
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
            setAccountType(null);
            setGstNumber("");
            setGstBusiness(null);
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

    const isAgencySignup = accountType === "agency";

    const validateBeforeOtp = (flow: AuthFlow): boolean => {
        const cleanPhone = phone.replace(/\D/g, "");

        if (flow === "signup" && !name.trim()) {
            showValidationError(
                isAgencySignup
                    ? "Please enter the contact person's name."
                    : "Please enter your full name."
            );
            return false;
        }

        /* Agency identity is proven by an Active GSTIN — no manual business entry */
        if (flow === "signup" && isAgencySignup) {
            if (!gstBusiness) {
                showValidationError(
                    "Please verify your GST number to continue."
                );
                return false;
            }

            if (isGstBlocked(gstBusiness)) {
                showValidationError(
                    `This GST registration is "${gstBusiness.status}". An Active GSTIN is required.`
                );
                return false;
            }
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
                    /* Agency registrations carry their verified GST identity */
                    ...(currentFlow === "signup"
                        ? {
                            accountType: accountType || "individual",
                            ...(isAgencySignup && gstBusiness
                                ? {
                                    gstNumber: gstBusiness.gst_number,
                                    gstDetailId: gstBusiness.gstDetailId,
                                }
                                : {}),
                        }
                        : {}),
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

            /*
             * Prefer whatever the backend returns; fall back to the identity we
             * just verified so an agency signup still behaves as an agency even
             * before the API echoes these fields back.
             */
            const verifiedUser = response.data.user || {};

            loginUser(
                {
                    ...verifiedUser,
                    accountType:
                        verifiedUser.accountType ||
                        accountType ||
                        "individual",
                    gstDetailId:
                        verifiedUser.gstDetailId ||
                        gstBusiness?.gstDetailId,
                    business:
                        verifiedUser.business || gstBusiness || null,
                },
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

    const changeScreen = (
        nextScreen:
            | "login"
            | "accountType"
            | "signup"
            | "signupAgency"
            | "otp"
    ) => {
        toast.dismiss();

        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setOtpError(false);
        setOtpErrorMessage("");
        setResendTimer(RESEND_TIME);
        setScreen(nextScreen);
    };

    /** Account type chosen → route to the plain or the GST-verified form. */
    const handleAccountTypeContinue = () => {
        if (!accountType) return;
        changeScreen(
            accountType === "agency" ? "signupAgency" : "signup"
        );
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

                    <div
                        className="client-auth-content"
                        data-screen={screen}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={screen}
                            className="client-auth-screen"
                            {...screenMotion}
                        >
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
                                            changeScreen("accountType")
                                        }
                                        disabled={loading}
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            </>
                        )}

                        {screen === "accountType" && (
                            <AccountTypeStep
                                value={accountType}
                                onSelect={setAccountType}
                                onContinue={handleAccountTypeContinue}
                                onBackToLogin={() =>
                                    changeScreen("login")
                                }
                                disabled={loading}
                            />
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

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeScreen("accountType")
                                        }
                                        disabled={loading}
                                    >
                                        Change account type
                                    </button>
                                </p>
                            </>
                        )}

                        {screen === "signupAgency" && (
                            <>
                                <h2
                                    id="client-auth-title"
                                    className="client-auth-title"
                                >
                                    Agency Sign Up
                                </h2>

                                <p className="client-auth-accounttype-question">
                                    Verify your GST — we&apos;ll fill in the rest.
                                </p>

                                <div className="client-auth-gst">
                                    <GstVerifyPanel
                                        variant="light"
                                        value={gstNumber}
                                        onChange={setGstNumber}
                                        onVerified={setGstBusiness}
                                        onCleared={() =>
                                            setGstBusiness(null)
                                        }
                                        business={gstBusiness}
                                        disabled={loading}
                                        requireActive
                                        /* Typing a valid 15-char GSTIN verifies
                                           on its own — no extra click needed */
                                        autoVerify
                                        /* Fixed-height modal: identity only,
                                           no registration metadata rows */
                                        compact
                                        helperText="Enter your 15-character GSTIN. Business name, PAN and address are fetched automatically."
                                    />
                                </div>

                                <div className="client-auth-fields">
                                    <input
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Contact Person Name"
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

                                {/* Deliberately NOT disabled on an unverified
                                    GST — a dead button gives no reason why.
                                    validateBeforeOtp explains what's missing. */}
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

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeScreen("accountType")
                                        }
                                        disabled={loading}
                                    >
                                        Change account type
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
                                                authFlow !== "signup"
                                                    ? "login"
                                                    : isAgencySignup
                                                        ? "signupAgency"
                                                        : "signup"
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
                                                    : "accountType"
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
                        </motion.div>
                      </AnimatePresence>

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