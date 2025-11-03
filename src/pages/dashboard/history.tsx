import { useParams } from "react-router";


export default function HistoryPage() {
    const { id } = useParams();

    return <div>History Page: {id}  </div>
}