import FRATReport from '@/components/frat-report';

// This is the page component for the FRAT report
export default function FRATReportPage({ params }: { params: { id: string; assessid: string } }) {
    return <FRATReport familyId={params.id} assessmentId={params.assessid} />;
}