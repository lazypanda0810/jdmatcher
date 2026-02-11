import { useState, useEffect } from "react";
import {
  Users,
  BarChart3,
  FileText,
  TrendingUp,
  Activity,
  Shield,
  Briefcase,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import {
  adminStats,
  usageData,
  adminUsers,
  recentActivity,
} from "@/utils/mockData";

const AdminPanel = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Layout isAuthenticated userName="Admin" userRole="admin">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <Activity className="w-8 h-8 text-accent" />
            <p className="text-sm text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated userName="Admin" userRole="admin">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-accent" />
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Admin Panel
            </h1>
          </div>
          <p className="text-muted-foreground">
            System overview, user management, and usage analytics.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={adminStats.totalUsers}
            trend="+12% this month"
            index={0}
          />
          <StatCard
            icon={FileText}
            label="Resumes Uploaded"
            value={adminStats.resumesProcessed.toLocaleString()}
            index={1}
          />
          <StatCard
            icon={Briefcase}
            label="Job Descriptions"
            value={adminStats.totalJobDescriptions}
            index={2}
          />
          <StatCard
            icon={BarChart3}
            label="Total Matches"
            value={adminStats.totalMatches.toLocaleString()}
            index={3}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Match Score"
            value={`${adminStats.avgScore}%`}
            index={4}
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Usage Trend */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card animate-fade-in-up">
            <h3 className="text-base font-heading font-semibold text-foreground mb-4">
              Usage Trends
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "13px" }} />
                  <Line
                    type="monotone"
                    dataKey="matches"
                    name="Matches"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    name="New Users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    opacity={0.7}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card animate-fade-in-up delay-100">
            <h3 className="text-base font-heading font-semibold text-foreground mb-4">
              Monthly Breakdown
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar
                    dataKey="matches"
                    name="Matches"
                    fill="hsl(var(--accent))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="users"
                    name="Users"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    opacity={0.5}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity & User Management */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden animate-fade-in-up delay-200">
            <div className="p-6 border-b border-border">
              <h3 className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((item) => (
                <div key={item.id} className="px-6 py-3.5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.user} — {item.detail}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {item.score !== null && (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${item.score >= 80 ? "bg-success/10 text-success" : item.score >= 60 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                          {item.score}%
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Management */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-card overflow-hidden animate-fade-in-up delay-200">
            <div className="p-6 border-b border-border">
              <h3 className="text-base font-heading font-semibold text-foreground">
                User Management
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Overview of all registered users
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "Recruiter" ? "bg-info/10 text-info" : "bg-accent/10 text-accent"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.status === "Active" ? "text-success" : "text-muted-foreground"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-success" : "bg-muted-foreground"}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{user.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
