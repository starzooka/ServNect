import { useEffect } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useSetAtom } from "jotai";
import { userAtom, authLoadingAtom } from "../atoms";

// ✅ GraphQL query for session check
const ME_QUERY = gql`
  query Me {
    me {
      id
      firstName
      lastName
      email
    }
  }
`;

// ✅ Reusable Spinner Overlay Component
const SpinnerOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="relative w-12 h-12">
      <div className="absolute w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

export default function AuthWrapper({ children }) {
  const setUser = useSetAtom(userAtom);
  const setAuthLoading = useSetAtom(authLoadingAtom);

  const { data, loading, error } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only", // Always check server
  });

  useEffect(() => {
    if (!loading) {
      if (data && data.me) {
        setUser(data.me); // ✅ Set user if logged in
      } else {
        setUser(null); // ❌ Not logged in
      }
      setAuthLoading(false);
    }
  }, [loading, data, error, setUser, setAuthLoading]);

  // ✅ Show overlay spinner while checking auth
  if (loading) {
    return <SpinnerOverlay />;
  }

  return children;
}
