import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { auth, rtdb as database } from "./firebase"; // Use rtdb
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { ref, get, set, remove, onValue } from "firebase/database";
import "../css/Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const admins = ["saleem1712005@gmail.com", "jayaraman00143@gmail.com", "abcd1234@gmail.com"];
  const [tempAdmins, setTempAdmins] = useState([]);

  // Fetch temp admins from Firebase on component mount
  useEffect(() => {
    const tempAdminsRef = ref(database, "tempadmin");
    onValue(tempAdminsRef, (snapshot) => {
      const tempAdminsList: string[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const tempAdminEmail = child.child("email").val();
          if (tempAdminEmail) tempAdminsList.push(tempAdminEmail.toLowerCase());
        });
      }
      setTempAdmins(tempAdminsList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching temp admins:", err);
      setLoading(false);
    });
  }, []);

  const migrateUserToTempAdmin = async (userId: string, userEmail: string) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) return false;

      const userData = userSnapshot.val();
      const tempAdminRef = ref(database, `tempadmin1/${userId}`);
      await set(tempAdminRef, { ...userData, email: userEmail });
      await remove(userRef);
      return true;
    } catch (error) {
      console.error("Error migrating user to tempadmin1:", error);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter all details");
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    setMessage("Logging in, please wait...");
    setMessageType("loading");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const emailLower = email.toLowerCase();

      let userType = "user";
      let userData: any = null;

      // 1️⃣ Admin check
      if (admins.includes(emailLower)) {
        userType = "admin";
        const adminSnap = await get(ref(database, `admins/${user.uid}`));
        if (adminSnap.exists()) userData = adminSnap.val();
      }
      // 2️⃣ Temp admin check
      else if (tempAdmins.includes(emailLower)) {
        userType = "tempadmin";
        // Migrate if needed
        const migrated = await migrateUserToTempAdmin(user.uid, email);
        const tempAdminSnap = await get(ref(database, `tempadmin1/${user.uid}`));
        if (tempAdminSnap.exists()) userData = tempAdminSnap.val();
      }
      // 3️⃣ Regular user
      else {
        const userSnap = await get(ref(database, `users/${user.uid}`));
        if (userSnap.exists()) userData = userSnap.val();
      }

      console.log("Fetched user data:", userData);

      setMessage("Login Successful! Redirecting...");
      setMessageType("success");

      setTimeout(() => {
        if (typeof onLogin === "function") onLogin();
        if (userType === "admin") navigate("/admin");
        else if (userType === "tempadmin") navigate("/tempadmin");
        else navigate("/xerox");
      }, 1000);

    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
        setMessage("Invalid email or password. Please try again.");
      } else {
        setMessage("Login failed. Please try again.");
      }
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
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
        setMessage("Check your email");
        setMessageType("success");
        setShowResetModal(false);
        setTimeout(() => setMessage(""), 4000);
      })
      .catch(() => {
        setMessage("Unable to send, failed");
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
            /> Show Password
          </label>
          <p className="forgotpasswordlinkloginl" onClick={handleForgotPassword}>
            Forgot Password?
          </p>
        </div>
        <button type="submit" className="loginbuttonloginl">Login</button>
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
              <button className="reset-buttonloginl" onClick={handleResetPassword}>Reset</button>
              <button className="cancel-buttonloginl" onClick={() => setShowResetModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
