import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  HStack,
  VStack,
  Spinner,
} from "@chakra-ui/react";

import {
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import { Chart, useChart } from "@chakra-ui/charts";

import {
  getTeamOverview,
  getTeamEnrollments,
  getTeamCompletionRate,
  getTeamOverdue,
  getTeamUserPerformance,
} from "../api/metrics";

function Card({ title, children }) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      rounded="xl"
      p={4}
      boxShadow="sm"
    >
      <Heading size="sm" mb={3}>
        {title}
      </Heading>
      {children}
    </Box>
  );
}

function Stat({ label, value }) {
  return (
    <VStack spacing={0} align="start">
      <Text fontSize="xs" color="gray.600">
        {label}
      </Text>
      <Heading size="md">{value}</Heading>
    </VStack>
  );
}

function ChartPie({ data, dataKey, nameKey }) {
  const safe = Array.isArray(data) ? data : [];
  const chart = useChart({
    data: safe,
    series: safe.map((item, i) => ({
      name: item[nameKey],
      color: `hsl(${(i * 360) / Math.max(safe.length, 1)}, 70%, 50%)`,
    })),
  });

  return (
    <Box h="380px">
      <Chart.Root chart={chart}>
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey={dataKey}
              nameKey={nameKey}
              labelLine={false}
            >
              {chart.data.map((_, i) => (
                <Cell
                  key={i}
                  fill={chart.color(chart.series[i]?.color || "blue.500")}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RePieChart>
        </ResponsiveContainer>
      </Chart.Root>
    </Box>
  );
}

function ChartBar({ data, xKey, bars }) {
  const safe = Array.isArray(data) ? data : [];
  const chart = useChart({
    data: safe,
    series: bars.map((b) => ({ name: b.key, color: b.color || "blue.500" })),
  });

  return (
    <Box h="380px">
      <Chart.Root chart={chart}>
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart
            data={chart.data}
            margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={chart.color("border.muted")}
            />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11 }}
              height={70}
              interval={0}
              angle={-45}
              textAnchor="end"
              tickMargin={10}
            />
            <YAxis tick={{ fontSize: 11 }} width={50} />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: "12px" }} />
            {chart.series.map((s) => (
              <Bar
                key={s.name}
                dataKey={chart.key(s.name)}
                fill={chart.color(s.color)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </ReBarChart>
        </ResponsiveContainer>
      </Chart.Root>
    </Box>
  );
}

export default function Team() {
  const { id: teamId } = useParams();

  const qOverview = useQuery({
    queryKey: ["t-overview", teamId],
    queryFn: () => getTeamOverview(teamId),
  });
  const qEnroll = useQuery({
    queryKey: ["t-enroll", teamId],
    queryFn: () => getTeamEnrollments(teamId),
  });
  const qRate = useQuery({
    queryKey: ["t-rate", teamId],
    queryFn: () => getTeamCompletionRate(teamId),
  });
  const qOverdue = useQuery({
    queryKey: ["t-overdue", teamId],
    queryFn: () => getTeamOverdue(teamId),
  });
  const qPerf = useQuery({
    queryKey: ["t-perf", teamId],
    queryFn: () => getTeamUserPerformance(teamId), // expected: [{ user:"George", rate: 78 }, ...]
  });

  const loading = [qOverview, qEnroll, qRate, qOverdue, qPerf].some(
    (q) => q.isLoading
  );
  if (loading) {
    return (
      <HStack justify="center" py={12}>
        <Spinner size="lg" />
        <Text>Loading team dashboard…</Text>
      </HStack>
    );
  }

  const err = [qOverview, qEnroll, qRate, qOverdue, qPerf].find((q) => q.error);
  if (err) {
    return (
      <Box color="red.600">
        Error: {err.error?.message || String(err.error)}
      </Box>
    );
  }

  const overview = qOverview.data || {};

  return (
    <Box>
      <Heading size="sm" mb={3}>
        Team KPIs
      </Heading>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={4}>
        <Card title="Members">
          <Stat label="Total" value={overview.members ?? "—"} />
        </Card>
        <Card title="Enrollments">
          <Stat label="Active" value={overview.enrollments ?? "—"} />
        </Card>
        <Card title="Completion rate">
          <Stat label="Team-wide" value={`${overview.completionRate ?? 0}%`} />
        </Card>
        <Card title="Overdue">
          <Stat label="Enrollments" value={overview.overdue ?? 0} />
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Card title="Enrollments per course (team)">
          <ChartPie data={qEnroll.data} dataKey="count" nameKey="title" />
        </Card>

        <Card title="Completion rate per course (team)">
          <ChartBar
            data={qRate.data}
            xKey="title"
            bars={[{ key: "rate", name: "Completion %", color: "green.500" }]}
          />
        </Card>

        <Card title="Overdue by course (team)">
          <ChartBar
            data={qOverdue.data}
            xKey="title"
            bars={[{ key: "count", name: "Overdue", color: "red.500" }]}
          />
        </Card>

        <Card title="Performance by employee (avg completion %)">
          <ChartBar
            data={qPerf.data}
            xKey="user"
            bars={[{ key: "rate", name: "Completion %", color: "purple.500" }]}
          />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
