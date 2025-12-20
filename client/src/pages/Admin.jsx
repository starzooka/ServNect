import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Admin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/admin/users`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <table className="w-full border">
        <thead className="bg-muted">
          <tr>
            <th className="p-2">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
