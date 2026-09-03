import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addUser } from "../../redux/userSlice"; // match whichever path fixed your earlier error
import { API_BASE } from "../../lib/api";
export default function OAuthSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    fetch(`${API_BASE}/api/auth/me`,
       {method:'GET',
        headers:{
          "Content-Type":'application/json'
        } ,
        credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        dispatch(addUser({ ...data.user})); // merge full user + token
        navigate("/", { replace: true });
      })
      .catch(() => navigate("/", { replace: true }));
  }, []);

  return <p>Signing you in…</p>;
}