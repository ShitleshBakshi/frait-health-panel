import { InfoForm, type InfoFormProps } from "./info-form"

type MainParentInfoProps = Pick<InfoFormProps, "open" | "onClose" | "onSubmit">

export function MainParentInfo({ open, onClose, onSubmit } : MainParentInfoProps) {
    return (
        <InfoForm
            open={open}
            onClose={onClose}
            onSubmit={onSubmit}
            title="The main parent/carer's information"
            relationshipLabel="Relationship to child/children"
            showParentalResponsibility={true}
            showInformationProvider={true}
        />
    )
}

