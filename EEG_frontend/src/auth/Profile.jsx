import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/login');
  };

  if (!user) return <div>Please login first.</div>;

  return (
    <div className="profile-card">
      <h2>👤 Profile</h2>
      <p><strong>Name:</strong> {user.name || 'Unknown'}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <button className="btn danger" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
