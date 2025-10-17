import React, { useState, useEffect } from "react";
import "./Profile.css";
import axios from "axios";
import Sidebar from "../../../Components/User/Sidebar/Sidebar";
import { format } from "date-fns";
import { FiEdit2, FiCheck, FiX, FiPlus, FiTrash2 } from "react-icons/fi";

const Profile = () => {
  const token = localStorage.getItem("token");
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState({
    profile: false,
    positions: false,
    adding: false,
    removing: false
  });
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    image: ""
  });

  const formatDate = (date) => {
    return format(new Date(date), "d MMMM yyyy");
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(prev => ({ ...prev, positions: true }));
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_SERVER_URL}/position/getPosition`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPositions(response.data.userPositions);
      setUserProfile(response.data.responseData);
      setEditData({
        name: response.data.responseData?.name || "",
        image: response.data.responseData?.image || ""
      });
      setError("");
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, positions: false }));
    }
  };

  const handleAddPosition = async () => {
    if (!selectedPosition) {
      setError("Please select a position");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, adding: true }));
      await axios.post(
        `${process.env.REACT_APP_BACKEND_SERVER_URL}/position/insertpositions`,
        { position: selectedPosition },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchPositions();
      setSelectedPosition("");
      setError("");
    } catch (err) {
      setError("Failed to add position. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, adding: false }));
    }
  };

  const handleRemovePosition = async (positionId) => {
    try {
      setLoading(prev => ({ ...prev, removing: true }));
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_SERVER_URL}/position/deleteposition`,
        {
          data: { position: positionId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchPositions();
      setError("");
    } catch (err) {
      setError("Failed to remove position. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, removing: false }));
    }
  };

  const handleEditProfile = async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_SERVER_URL}/profile/update`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchPositions();
      setEditing(false);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const availablePositions = [
    "FULL_STACK_DEVELOPER",
    "POWER_BI_DEVELOPER",
    "SALES",
    "HUMAN_RESOURCE",
    "TESTING",
    "SALESFORCE",
    "PUBLIC",
    "CUSTOMER_SUCCESS"
  ].filter((pos) => !positions.some(p => p.user_position === pos));

  const formatPositionName = (position) => {
    return position.split("_").join(" ");
  };

  return (
    <div className="profile-page">
      <Sidebar />
      <main className="profile-main-content">
        <div className="profile-banner">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {userProfile?.image ? (
                <img 
                  src={userProfile.image} 
                  alt={userProfile.name} 
                />
              ) : (
                <span>{userProfile?.name?.charAt(0)}</span>
              )}
            </div>
            {editing && (
              <div className="avatar-edit">
                <input
                  type="text"
                  value={editData.image}
                  onChange={(e) => setEditData({...editData, image: e.target.value})}
                  placeholder="Enter image URL"
                />
              </div>
            )}
          </div>
        </div>

        <section className="profile-info-section">
          <div className="profile-header">
            <h2>
              {editing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                />
              ) : (
                userProfile?.name
              )}
            </h2>
           {/*  <div className="profile-actions">
              {editing ? (
                <>
                  <button 
                    className="save-btn"
                    onClick={handleEditProfile}
                    disabled={loading.profile}
                  >
                    <FiCheck /> {loading.profile ? "Saving..." : "Save"}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setEditing(false);
                      setEditData({
                        name: userProfile?.name || "",
                        image: userProfile?.image || ""
                      });
                    }}
                  >
                    <FiX /> Cancel
                  </button>
                </>
              ) : (
                <button 
                  className="edit-btn"
                  onClick={() => setEditing(true)}
                >
                  <FiEdit2 /> Edit Profile
                </button>
              )}
            </div> */}
          </div>

          <div className="profile-details-grid">
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{userProfile?.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">User Type:</span>
              <span className="detail-value">{userProfile?.organizations[0]?.userType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Organization:</span>
              <span className="detail-value">{userProfile?.organizations[0]?.organizationName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since:</span>
              <span className="detail-value">{userProfile && formatDate(userProfile.createdAt)}</span>
            </div>
          </div>
        </section>

        <section className="positions-section">
          <h2 className="section-title">Your Positions</h2>
          
          {error && <div className="error-message">{error}</div>}

          <div className="add-position-card">
            <h3>Add New Position</h3>
            <div className="position-form-group">
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                disabled={loading.adding || availablePositions.length === 0}
              >
                <option value="">Select a position</option>
                {availablePositions.map((pos) => (
                  <option key={pos} value={pos}>
                    {formatPositionName(pos)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddPosition}
                disabled={loading.adding || !selectedPosition}
                className="add-position-btn"
              >
                <FiPlus /> {loading.adding ? "Adding..." : "Add Position"}
              </button>
            </div>
          </div>

          <div className="current-positions-card">
            <h3>Current Positions</h3>
            {loading.positions ? (
              <div className="loading-state">Loading positions...</div>
            ) : positions.length === 0 ? (
              <div className="empty-state">No positions added yet</div>
            ) : (
              <ul className="positions-list">
                {positions.map((position) => (
                  <li key={position.id} className="position-item">
                    <span>{formatPositionName(position.user_position)}</span>
                    <button
                      onClick={() => handleRemovePosition(position.id)}
                      disabled={loading.removing}
                      className="remove-position-btn"
                    >
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;