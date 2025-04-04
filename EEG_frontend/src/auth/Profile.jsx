import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/user", {
      method: "GET",
      headers: { Authorization: token },
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setUser(data);
        }
      })
      .catch(() => {
        alert("Could not fetch user data");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-card">
      <h2>👤 Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <button className="btn danger" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
