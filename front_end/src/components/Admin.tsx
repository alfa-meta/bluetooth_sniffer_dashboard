import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { handleLogout } from "../functions/AuthFunctions";

const AdminWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 50%;
  margin-bottom: 20px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-light);
  padding: 5px 10px;
`;

const SearchIcon = styled(FaSearch)`
  color: var(--text-dark);
  margin-right: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--text-dark);
  font-size: 16px;
  outline: none;
`;

const Table = styled.table`
  width: 80%;
  border-collapse: collapse;
  margin-top: 20px;
  background: var(--bg-light);
  color: var(--text-dark);
  border: 2px solid var(--border-color);
`;

const Th = styled.th`
  padding: 10px;
  border-bottom: 2px solid var(--border-color);
  border-right: 2px solid var(--border-color);
  text-align: center;
  background: var(--table-header);
  cursor: pointer;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  border-right: 2px solid var(--border-color);
  text-align: center;
  `;

const DeleteButton = styled.button`
  padding: 5px 10px;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  &:hover {
    background: darkred;
  }
`;

const Admin: React.FC = () => {
  const [users, setUsers] = useState<
    { uid: number; username: string; email: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please login");
      handleLogout();
      navigate("/");
      return;
    }
    try {
      const response = await axios.get("http://127.0.0.1:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      // Check error response
      if (err.response?.status === 401) {
        console.log("Session expired. Please log in again.");
        handleLogout();
        navigate("/");
      } else {
        setError("Failed to fetch user data");
      }
      handleLogout();
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (uid: number, username: string) => {
    const confirmDelete = await window.confirm(`Are you sure you want to delete ${username}?`);
    if (!confirmDelete) return; // Stop if the user cancels the action
  
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please login");
      handleLogout();
      navigate("/");
      return;
    }
    try {
      await axios.delete(`http://127.0.0.1:5000/delete_user/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user.uid !== uid));
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.log("Session expired. Please log in again.");
      } else {
        setError("Failed to delete user");
      }
      handleLogout();
      navigate("/");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminWrapper>
      <h2>User List</h2>
      <SearchContainer>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Search Admin"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      {error ? (
        <p>{error}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>UID</Th>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.uid}>
                <Td>{user.uid}</Td>
                <Td>{user.username}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <DeleteButton onClick={() => handleDelete(user.uid, user.username)}>
                    Delete
                  </DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </AdminWrapper>
  );
};

export default Admin;
