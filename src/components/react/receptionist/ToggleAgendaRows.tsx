import { useState } from "react";

const VISIBLE = 7;

interface Props {
    total: number;
}

export function ToggleAgendaRows({ total }: Props) {
    let [expanded, setExpanded] = useState(false);

    const toggle = () => {
        expanded = !expanded;
        document.querySelectorAll(".agenda-row").forEach((row) => {
            const index = Number(row.getAttribute("data-index"));
            if (index >= VISIBLE) {
                row.classList.toggle("hidden", !expanded);
            }
        });
        setExpanded((prev) => !prev);
    };

    if (total <= VISIBLE) return null;

    return (
        <div className="mt-3 flex justify-center">
            <button
                onClick={toggle}
                className="text-body-xs font-medium text-primary-600 hover:underline"
            >
                {expanded ? "Ver menos" : `Ver todo (${total})`}
            </button>
        </div>
    );
}