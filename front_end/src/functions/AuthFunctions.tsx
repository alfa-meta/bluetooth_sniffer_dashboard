export function handleLogout(){
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("scanner_scanning_status");
}