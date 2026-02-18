import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/card";

export default function DashboardPage() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardDescription>Total Throughput</CardDescription>
                    <CardTitle>42 tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Optimistic workflow enabled for task updates.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardDescription>In Progress</CardDescription>
                    <CardTitle>8 active</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Keep momentum with focused execution windows.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardDescription>Completion Rate</CardDescription>
                    <CardTitle>92%</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Stable performance this week across key priorities.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardDescription>Critical Tasks</CardDescription>
                    <CardTitle>2 flagged</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Review and close blockers before end of day.</p>
                </CardContent>
            </Card>
        </div>
    );
}
