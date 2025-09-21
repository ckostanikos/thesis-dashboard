import { useQuery } from "@tanstack/react-query";
import { fetchOrgKpis } from "../api/kpis";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, Heading, Text, Stack, Spinner, Flex } from "@chakra-ui/react";

export default function Org() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["kpi", "org"],
    queryFn: fetchOrgKpis,
  });

  if (isLoading) {
    return (
      <Flex py={8} justify="center">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box
        my={4}
        p={3}
        border="1px solid"
        borderColor="red.200"
        bg="red.50"
        color="red.800"
        borderRadius="md"
        fontSize="sm"
      >
        Error: {error.message}
      </Box>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(),
    completion: d.completionRate,
    score: d.avgScore,
  }));

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="2xl"
      boxShadow="sm"
      p={6}
    >
      <Heading size="sm" mb={4}>
        Completion & Avg Score
      </Heading>

      <Box h="320px" mb={4}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#4B5563" />
            <YAxis stroke="#4B5563" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#F9FAFB",
                color: "#111827",
                borderRadius: 8,
                border: "1px solid #E5E7EB",
              }}
            />
            <Line
              type="monotone"
              dataKey="completion"
              stroke="#2563EB"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#16A34A"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Stack spacing={2}>
        {data.map((row) => (
          <Box
            key={row._id}
            bg="#F9FAFB"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            p={3}
            color="gray.900"
          >
            <Flex justify="space-between">
              <Text>{new Date(row.date).toLocaleDateString()}</Text>
              <Text>
                Completion: {row.completionRate}% • AvgScore: {row.avgScore}
              </Text>
            </Flex>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
