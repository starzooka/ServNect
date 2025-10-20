import { useEffect } from 'react';
import { gql } from '@apollo/client';
// Make sure you use the import that works for you
import { useQuery } from '@apollo/client/react';
import { useSetAtom } from 'jotai';

import { userAtom, authLoadingAtom } from '../atoms';

// MODIFIED: This query is now correct
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

export default function AuthWrapper({ children }) {
  const setUser = useSetAtom(userAtom);
  const setAuthLoading = useSetAtom(authLoadingAtom);

  // Run the 'me' query on component mount
  const { data, loading, error } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only', // Always check the network
  });

  useEffect(() => {
    if (!loading) {
      if (data && data.me) {
        // User is logged in, set the global state
        setUser(data.me);
      } else {
        // No user data or error, so they are logged out
        setUser(null);
      }
      // We are done with the initial check
      setAuthLoading(false);
    }
  }, [loading, data, error, setUser, setAuthLoading]);

  // Render nothing or a loading spinner until the check is complete
  if (loading) {
    // You can make this a more integrated loading spinner later
    return <div>Loading session...</div>;
  }

  // Render the rest of the app
  return children;
}