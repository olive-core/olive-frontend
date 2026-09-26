export default function Detail({prescriptionId}: {prescriptionId:string}) {
    return <div data-testid="consultation-viewer">Prescription and notes: {prescriptionId}</div>;
}
