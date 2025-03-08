import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"

interface StatisticProps {
  title: string
  value: number
}

function Statistic({ title, value }: StatisticProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

export function DashboardContent() {
    const user = useSelector((state: RootState) => state.user)
    return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
          <h1 className="text-2xl font-semibold text-gray-900">
              Welcome {user.username} - {user.healthBoard}
          </h1>
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
        <p className="text-gray-500 mb-4">The following is an overview of website activities:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Statistic title="Families" value={1} />
          <Statistic title="Assessments" value={0} />
        </div>
      </div>
    </div>
  )
}

