import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

export const description = "An area chart"

const chartData = [
    { date: "2024-04-01", count: 222 },
    { date: "2024-04-02", count: 97 },
    { date: "2024-04-03", count: 167 },
    { date: "2024-04-04", count: 242 },
    { date: "2024-04-05", count: 373 },
    { date: "2024-04-06", count: 301 },
    { date: "2024-04-07", count: 245 },

]

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    count: {
        label: "Count",
        color: "var(--chart-2)",
    }
} satisfies ChartConfig

export function DayWiseAreaChart() {


    return (

        <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full w-full pt-6 pb-2 pr-4"
        >
            <AreaChart data={chartData}>
                <defs>
                    <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-count)"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-count)"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })
                    }}
                />
                <YAxis
                    dataKey="count"
                    type="number"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            labelFormatter={(value) => {
                                return new Date(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                            indicator="dot"
                        />
                    }
                />

                <Area
                    dataKey="count"
                    type="natural"
                    fill="url(#fillCount)"
                    stroke="var(--color-count)"
                    stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
        </ChartContainer>
    )
}
