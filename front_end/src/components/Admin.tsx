import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const AdminWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
`;

const Table = styled.table`
  width: 80%;
  border-collapse: collapse;
  margin-top: 20px;
  background: var(--bg-light);
  color: var(--text-dark);
`;

const Th = styled.th`
  padding: 10px;
  border-bottom: 2px solid var(--border-color);
  text-align: left;
  background: var(--table-header);
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
`;

const Button = styled.button`
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
    { uid: number; username: string; password: string; email: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please login");
      localStorage.removeItem("token");
      navigate("/");
      return;
    }
    try {
      const response = await axios.get("http://127.0.0.1:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch user data");
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (uid: number, username: string) => {
    const confirmDelete = await window.confirm(
      `Are you sure you want to delete ${username}?`
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please login");
      localStorage.removeItem("token");
      navigate("/");
      return;
    }
    try {
      await axios.delete(`http://127.0.0.1:5000/delete_user/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user.uid !== uid)); // Remove user from state
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  return (
    <AdminWrapper>
      <h2>User List</h2>
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
            {users.map((user) => (
              <tr key={user.uid}>
                <Td>{user.uid}</Td>
                <Td>{user.username}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Button onClick={() => handleDelete(user.uid, user.username)}>
                    Delete
                  </Button>
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
