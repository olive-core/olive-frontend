import { useState } from "react";
import FilterBar from "./filters/filter-bar";
import { EMPTY_INSIGHT_FILTERS, type InsightFilters } from "./filters/insight-filters";
import QuestionRail from "./question-rail";
import type { DrillDown, QuestionKey } from "./questions";
import ScopeSummary from "./scope-summary";
import OverduePrompt from "./overdue-prompt";
import { useFilterOptions } from "./use-insights";
import OverviewCard from "./overview-card";
import TopComplaintsCard from "./top-complaints-card";
import ComplaintDiagnosisCard from "./complaint-diagnosis-card";
import FollowUpCard from "./follow-up-card";
import EarlyReturnsCard from "./early-returns-card";
import ProtocolCard from "./protocol-card";
import RisingCard from "./rising-card";

export default function InsightsPage() {
    const [filters, setFilters] = useState<InsightFilters>(EMPTY_INSIGHT_FILTERS);
    // Opens on the question that carries a finding. "Who's coming" only says something
    // a doctor does not already know once they have narrowed to a complaint.
    const [question, setQuestion] = useState<QuestionKey>("complaints");
    const { data: options } = useFilterOptions();

    const drill: DrillDown = (patch, to) => {
        setFilters((current) => ({ ...current, ...patch }));
        setQuestion(to);
    };

    const answers: Record<QuestionKey, React.ReactNode> = {
        who:        <OverviewCard filters={filters} />,
        complaints: <TopComplaintsCard filters={filters} onDrill={drill} />,
        diagnosis:  <ComplaintDiagnosisCard filters={filters} onDrill={drill} />,
        returning:  (
            <div className="space-y-5">
                <FollowUpCard filters={filters} onDrill={drill} />
                <EarlyReturnsCard filters={filters} />
            </div>
        ),
        protocol:   <ProtocolCard filters={filters} onPick={(diagnosis) => setFilters({ ...filters, diagnosis })} />,
        changing:   <RisingCard filters={filters} onDrill={drill} />,
    };

    return (
        <div className="flex-1 bg-slate-50">
            <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
                <header className="mb-4">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Insights</h1>
                    <ScopeSummary filters={filters} />
                </header>

                <FilterBar filters={filters} onChange={setFilters} options={options} />

                {/* The follow-up card carries its own copy, so it would read twice there. */}
                {question !== "returning" && (
                    <div className="mt-3">
                        <OverduePrompt filters={filters} onOpen={() => setQuestion("returning")} />
                    </div>
                )}

                <div className="mt-6">
                    <QuestionRail value={question} onChange={setQuestion} />
                </div>

                <div className="mt-4 pb-4">{answers[question]}</div>
            </div>
        </div>
    );
}
