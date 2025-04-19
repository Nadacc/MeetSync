import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404</h1>
      <p>Page Not Found</p>
      <Button onClick={() => navigate("/")}>Home</Button>
    </div>
  );
};

export default NotFound;
