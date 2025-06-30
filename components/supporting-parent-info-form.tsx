import { InfoForm, type InfoFormProps } from "./info-form"

type SupportingParentInfoProps = Pick<InfoFormProps, "open" | "onClose" | "onSubmit">

export function SupportingParentInfo({ open, onClose, onSubmit } : SupportingParentInfoProps) {
    return (
        <InfoForm
            open={open}
            onClose={onClose}
            onSubmit={onSubmit}
            title="The Supporting parent/carer's information"
            relationshipLabel="Relationship to child/children"
            showParentalResponsibility={true}
            showInformationProvider={true}
        />
    )
}

