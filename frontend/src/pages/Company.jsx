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
  getOverview,
  getEnrollmentsByCourse,
  getCompletionRateByCourse,
  getTeamPerformance,
  getOverdueByCourse,
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
    series: safe.map((item, index) => ({
      name: item[nameKey],
      color: `hsl(${(index * 360) / safe.length}, 70%, 50%)`, // Generate different colors
    })),
  });

  return (
    <Box h="380px" px={0}>
      <Chart.Root chart={chart}>
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
              labelLine={false}
            >
              {chart.data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chart.color(chart.series[index]?.color || "blue.500")}
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
    series: bars.map((bar) => ({
      name: bar.key,
      color: bar.color || "blue.500",
    })),
  });

  return (
    <Box h="380px" px={0}>
      <Chart.Root chart={chart}>
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart
            data={chart.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
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
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            {chart.series.map((item) => (
              <Bar
                key={item.name}
                dataKey={chart.key(item.name)}
                fill={chart.color(item.color)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </ReBarChart>
        </ResponsiveContainer>
      </Chart.Root>
    </Box>
  );
}

export default function Company() {
  const qOverview = useQuery({
    queryKey: ["m-overview"],
    queryFn: getOverview,
  });
  const qEnroll = useQuery({
    queryKey: ["m-enroll"],
    queryFn: getEnrollmentsByCourse,
  });
  const qRate = useQuery({
    queryKey: ["m-rate"],
    queryFn: getCompletionRateByCourse,
  });
  const qTeam = useQuery({ queryKey: ["m-team"], queryFn: getTeamPerformance });
  const qOverdue = useQuery({
    queryKey: ["m-overdue"],
    queryFn: getOverdueByCourse,
  });

  const loading = [qOverview, qEnroll, qRate, qTeam, qOverdue].some(
    (q) => q.isLoading
  );

  if (loading) {
    return (
      <HStack justify="center" py={12}>
        <Spinner size="lg" />
        <Text>Loading dashboard…</Text>
      </HStack>
    );
  }

  const error = [qOverview, qEnroll, qRate, qTeam, qOverdue].find(
    (q) => q.error
  );
  if (error) {
    return (
      <Box color="red.600">
        Error: {error.error?.message || String(error.error)}
      </Box>
    );
  }

  const overview = qOverview.data;

  return (
    <Box>
      {/* KPIs */}
      <SimpleGrid columns={{ base: 2, md: 5 }} gap={4} mb={4}>
        <Card title="Users">
          <Stat label="Total" value={overview.users} />
        </Card>
        <Card title="Courses">
          <Stat label="Total" value={overview.courses} />
        </Card>
        <Card title="Enrollments">
          <Stat label="Active" value={overview.enrollments} />
        </Card>
        <Card title="Completion rate">
          <Stat label="Company-wide" value={`${overview.completionRate}%`} />
        </Card>
        <Card title="Overdue">
          <Stat label="Enrollments" value={overview.overdue} />
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Card title="Enrollments per course (top 10)">
          <ChartPie data={qEnroll.data} dataKey="count" nameKey="title" />
        </Card>

        <Card title="Completion rate per course (top 10)">
          <ChartBar
            data={qRate.data}
            xKey="title"
            bars={[{ key: "rate", name: "Completion %", color: "green.500" }]}
          />
        </Card>

        <Card title="Team performance (avg completion %)">
          <ChartBar
            data={qTeam.data}
            xKey="team"
            bars={[{ key: "rate", name: "Completion %", color: "purple.500" }]}
          />
        </Card>

        <Card title="Overdue by course">
          <ChartBar
            data={qOverdue.data}
            xKey="title"
            bars={[{ key: "count", name: "Overdue", color: "red.500" }]}
          />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
