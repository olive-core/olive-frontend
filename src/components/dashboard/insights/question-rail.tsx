import { useId } from 'react'
import { cn } from '@/lib/utils'
import { QUESTIONS, type QuestionKey } from './questions'

interface QuestionRailProps {
    value: QuestionKey;
    onChange: (question: QuestionKey) => void;
}

export default function QuestionRail({ value, onChange }: QuestionRailProps) {
    const selectId = useId()
    return (
        <div>
            <div className="sm:hidden">
                <label htmlFor={selectId} className="mb-2 block text-xs font-medium text-slate-500">What would you like to explore?</label>
                <select id={selectId} value={value} onChange={(event) => onChange(event.target.value as QuestionKey)} className="min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-medium text-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-600">
                    {QUESTIONS.map((question) => <option key={question.key} value={question.key}>{question.label}</option>)}
                </select>
            </div>
            <div role="group" aria-label="Explore a question" className="hidden flex-wrap gap-2 sm:flex">
                {QUESTIONS.map((question) => (
                    <button key={question.key} type="button" aria-pressed={value === question.key} onClick={() => onChange(question.key)}
                        className={cn('min-h-11 rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
                            value === question.key ? 'bg-emerald-700 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300')}>
                        {question.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
