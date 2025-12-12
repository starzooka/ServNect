import React from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function MessagesPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Messages</h2>
      <p className="text-sm text-muted-foreground mb-4">All conversations with potential and current clients.</p>
      <Card>
        <CardContent>
          <div className="text-sm text-muted-foreground">Messaging UI coming soon — connect this to your realtime backend or Pusher/Socket service.</div>
        </CardContent>
      </Card>
    </div>
  )
}
