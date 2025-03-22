import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

interface Log {
  mac_address: string;
  first_seen: string;
  last_seen: string;
  count: number;
  scan_number: number;
}

const LogsWrapper = styled.div`
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  background: var(--button-bg);
  color: var(--text-light);
  border: none;
  padding: 15px 25px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: var(--red);
  }
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
  text-align: left;
  background: var(--table-header);
  cursor: pointer;
`;

const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  border-right: 2px solid var(--border-color);
`;

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchLogs = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please login");
      localStorage.removeItem("token");
      navigate("/");
      return;
    }
    setIsRefreshing(true);
    try {
      const response = await axios.get<Log[]>(
        "http://127.0.0.1:5000/logs",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setError("Failed to fetch logs");
      localStorage.removeItem("token");
      navigate("/");
    } finally {
      setIsRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(
    (log) =>
      log.mac_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(log.first_seen).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(log.last_seen).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <LogsWrapper>
      <h2>Logs</h2>
      <SearchContainer>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Search logs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>
      <ButtonContainer>
        <Button onClick={fetchLogs}>
          {isRefreshing ? "Refreshing..." : "Refresh Logs"}
        </Button>
      </ButtonContainer>
      {error ? (
        <p>{error}</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>MAC Address</Th>
              <Th>First Seen</Th>
              <Th>Last Seen</Th>
              <Th>Count</Th>
              <Th>Scan Number</Th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr key={index}>
                <Td>{log.mac_address}</Td>
                <Td>
                  {new Date(parseInt(log.first_seen) * 1000).toLocaleString()}
                </Td>
                <Td>
                  {new Date(parseInt(log.last_seen) * 1000).toLocaleString()}
                </Td>
                <Td>{log.count}</Td>
                <Td>{log.scan_number}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </LogsWrapper>
  );
};

export default Logs;
