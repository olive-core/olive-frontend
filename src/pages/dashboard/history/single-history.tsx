import { useParams } from "react-router";


export default function SingleHistoryPage() {
    const { id } = useParams();

    return <div>History Page: {id}  </div>
}