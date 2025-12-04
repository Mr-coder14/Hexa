import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import "../css/Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter all details");
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    if (password.length < 6) {
      setMessage("Incorrect Password");
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    setMessage("Logging in, please wait...");
    setMessageType("loading");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setMessage("Login Successful! Redirecting...");
      setMessageType("success");

      setTimeout(() => {
        if (typeof onLogin === "function") onLogin();

        // Redirect based on email
        const adminEmails = ["saleem1712005@gmail.com", "jayaraman00143@gmail.com", "abcd1234@gmail.com"];
        const emailLower = email.toLowerCase();

        if (adminEmails.includes(emailLower)) navigate("/admin");
        else navigate("/xerox"); // Normal user
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("Invalid email or password. Please try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => setShowResetModal(true);

  const handleResetPassword = () => {
    if (!resetEmail) {
      setMessage("Please enter your registered email");
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setMessage("Check your email for reset instructions");
        setMessageType("success");
        setShowResetModal(false);
        setTimeout(() => setMessage(""), 4000);
      })
      .catch(() => {
        setMessage("Failed to send reset email");
        setMessageType("error");
        setTimeout(() => setMessage(""), 4000);
      });
  };

  if (loading) return <div className="loadingloginl">Loading...</div>;

  return (
    <div className="loginboxloginl">
      <form className="loginbox1loginl" onSubmit={handleLogin}>
        <h2 className="loginh1loginl">Login</h2>

        <input
          className="logininputloginl"
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-containerloginl">
          <input
            className="logininputloginl"
            type={showPassword ? "text" : "password"}
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="showloginl">
          <label className="show-passwordloginl">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show Password
          </label>
          <p className="forgotpasswordlinkloginl" onClick={handleForgotPassword}>
            Forgot Password?
          </p>
        </div>

        <button type="submit" className="loginbuttonloginl">Login</button>

        {message && <div className={`loginmessageloginl ${messageType}`}>{message}</div>}

        <p className="signup-linkloginl">
          Don't have an account?
          <span
            className="signup-textloginl"
            onClick={() => navigate("/signup")}
            style={{ color: "blue", cursor: "pointer", textDecoration: "underline", fontSize: "16px" }}
          >
            Create Account
          </span>
        </p>
      </form>

      {showResetModal && (
        <div className="reset-modaloginl">
          <div className="reset-modal-contentloginl">
            <h4>Reset Password</h4>
            <input
              type="email"
              placeholder="Enter your email for reset"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="reset-email-inputloginl"
            />
            <div className="reset-buttonsloginl">
              <button className="reset-buttonloginl" onClick={handleResetPassword}>
                Reset
              </button>
              <button className="cancel-buttonloginl" onClick={() => setShowResetModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
