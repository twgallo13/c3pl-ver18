import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

type Props = { title: string; subtitle?: string; showAdd?: boolean };

export default function EmptyState({ title, subtitle, showAdd }: Props) {
    const nav = useNavigate();
    return (
        <div className="rounded-2xl border p-8 text-center">
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm opacity-80">{subtitle}</p> : null}
            {showAdd ? (
                <div className="mt-4">
                    <Button variant="primary" onClick={() => nav("/clients/new")} aria-label="Add Client">
                        Add Client
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
