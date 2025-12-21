import { useAtom } from "jotai";
import { userAtom } from "../atoms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Profile() {
  const [user] = useAtom(userAtom);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">My Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <ProfileRow label="First Name" value={user.firstName} />
          <ProfileRow label="Last Name" value={user.lastName} />
          <ProfileRow label="Email" value={user.email} />

        </CardContent>
      </Card>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
