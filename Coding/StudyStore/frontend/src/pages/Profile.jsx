import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import Icon from "../components/Icon";

function Profile() {

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    role: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {

    try {

      const userId = localStorage.getItem("userId");

      const res = await API.get(`/users/profile/${userId}`);

      setUser(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const handleChange = (e) => {

    setUser({
      ...user,
      [e.target.name]: e.target.value
    });

  };

  const updateProfile = async () => {

    try {

      const userId = localStorage.getItem("userId");

      await API.put(`/users/profile/${userId}`, user);

      toast.success("Profile Updated Successfully");

      fetchProfile();

    } catch (error) {

      console.log(error);

      toast.error("Failed To Update Profile");

    }

  };

  return (

    <div className="profile-page">

      <div className="profile-card">

        <div className="profile-top">

          <img
            src={`https://ui-avatars.com/api/?name=${user.name}&background=8FBC8F&color=fff&size=200`}
            alt={user.name}
          />

          <h1>{user.name}</h1>

          <p>{user.email}</p>

        </div>

        <div className="profile-info">

          <h2>Edit Profile</h2>

          <input
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Name"
          />

          <input
            name="email"
            value={user.email}
            readOnly
          />

          <input
            name="phone"
            value={user.phone}
            onChange={handleChange}
            placeholder="Phone Number"
          />

          <input
            name="address"
            value={user.address}
            onChange={handleChange}
            placeholder="Address"
          />

          <input
            name="city"
            value={user.city}
            onChange={handleChange}
            placeholder="City"
          />

          <input
            name="state"
            value={user.state}
            onChange={handleChange}
            placeholder="State"
          />

          <input
            name="pincode"
            value={user.pincode}
            onChange={handleChange}
            placeholder="Pincode"
          />

          <button
            className="save-profile-btn"
            onClick={updateProfile}
          >
            <Icon name="save" /> Save Profile
          </button>

        </div>

      </div>

    </div>

  );

}

export default Profile;