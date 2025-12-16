import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userAtom, authLoadingAtom } from "../atoms";
import AppPreloader from "./AppPreloader";

export default function ProtectedRoute() {
  const user = useAtomValue(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);
  const location = useLocation();

  if (authLoading) {
    return <AppPreloader loading />;
  }

  if (!user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
