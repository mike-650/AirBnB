import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    // ? Do we need to re-render?
    // setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(
        async (res) => {
        const data = await res.json()
          if (data.statusCode === 401) {
            setErrors({error: 'The provided credentials were invalid'})
          }
        }
      );
  };

  const disableBtn = () => {
    if (credential.length < 4 || password.length < 6) {
      return true;
    };
    return false;
  }

  const demoUser = (e) => {
    e.preventDefault();
    return dispatch(sessionActions.login({ credential : 'Demo-user', password : 'password'}))
      .then(closeModal)
  }

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        {errors.error && <p className="error">{`* ${errors.error}`}</p>}
        <input
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
          placeholder="Username or Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
        />
        <button type="submit" disabled={disableBtn()}>Log In</button>
        <Link to='/' onClick={demoUser} style={{textAlign:'center', padding:'12px'}}>Demo User</Link>
      </form>
    </>
  );
}

export default LoginFormModal;
