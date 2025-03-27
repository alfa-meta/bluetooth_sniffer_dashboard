import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

interface Log {
  mac_address: string;
  device_vendor: string;
  target_device: number;
  first_seen: string;
  last_seen: string;
  count: number;
  scan_number: number;
}

const PageSpan = styled.span`
  padding: 20px;
  flex: 1;
  text-align: center;
`;

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
    background: var(--highlight);
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

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Log; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
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
      const response = await axios.get<Log[]>("http://127.0.0.1:5000/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const filteredLogs = logs.filter((log) =>
    log.mac_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(parseInt(log.first_seen) * 1000)
      .toLocaleString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    new Date(parseInt(log.last_seen) * 1000)
      .toLocaleString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    String(log.count).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(log.scan_number).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (column: keyof Log) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: column, direction });
  };

  const sortedLogs = useMemo(() => {
    const sortableLogs = [...filteredLogs];
    if (sortConfig !== null) {
      sortableLogs.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        // Parse timestamps as numbers for proper sorting
        if (sortConfig.key === "first_seen" || sortConfig.key === "last_seen") {
          aValue = parseInt(aValue);
          bValue = parseInt(bValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        } else {
          return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }
      });
    }
    return sortableLogs;
  }, [filteredLogs, sortConfig]);

  // Compute current logs for pagination
  const currentLogs = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedLogs.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedLogs, currentPage]);

  // Reset page when searchTerm changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <LogsWrapper>
      <h2>Logs</h2>
      <SearchContainer>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Search Logs"
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
        <>
          <Table>
            <thead>
              <tr>
                <Th onClick={() => handleSort("mac_address")}>MAC Address</Th>
                <Th onClick={() => handleSort("device_vendor")}>Device Vendor</Th>
                <Th onClick={() => handleSort("target_device")}>Target Device</Th>
                <Th onClick={() => handleSort("first_seen")}>First Seen</Th>
                <Th onClick={() => handleSort("last_seen")}>Last Seen</Th>
                <Th onClick={() => handleSort("count")}>Count</Th>
                <Th onClick={() => handleSort("scan_number")}>Scan Number</Th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => (
                <tr key={index}>
                  <Td>{log.mac_address}</Td>
                  <Td>{log.device_vendor}</Td>
                  <Td>{log.target_device ? "True" : "False"}</Td>
                  <Td>{new Date(parseInt(log.first_seen) * 1000).toLocaleString()}</Td>
                  <Td>{new Date(parseInt(log.last_seen) * 1000).toLocaleString()}</Td>
                  <Td>{log.count}</Td>
                  <Td>{log.scan_number}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <ButtonContainer>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(sortedLogs.length / itemsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(sortedLogs.length / itemsPerPage)}
            >
              Next
            </Button>
          </ButtonContainer>
          <PageSpan>
              Page {currentPage} of {Math.ceil(sortedLogs.length / itemsPerPage)}
          </PageSpan>
        </>
      )}
    </LogsWrapper>
  );
};

export default Logs;
