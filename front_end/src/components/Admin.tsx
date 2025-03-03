import React, { useEffect, useState } from "react";
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

const Admin: React.FC = () => {
  const [users, setUsers] = useState<{ uid: number; username: string; email: string, password: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found, please login");
        return;
      }
      try {
        const response = await axios.get("http://127.0.0.1:5000/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        setError("Failed to fetch user data");
      }
    };
    fetchUsers();
  }, []);

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
              <Th>Password</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid}>
                <Td>{user.uid}</Td>
                <Td>{user.username}</Td>
                <Td>{user.email}</Td>
                <Td>{user.password}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </AdminWrapper>
  );
};

export default Admin;
