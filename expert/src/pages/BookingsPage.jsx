import React from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function BookingsPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Bookings</h2>
      <p className="text-sm text-muted-foreground mb-4">View and manage upcoming bookings.</p>
      <Card>
        <CardContent>
          <div className="text-sm text-muted-foreground">No bookings yet (demo)</div>
        </CardContent>
      </Card>
    </div>
  )
}
