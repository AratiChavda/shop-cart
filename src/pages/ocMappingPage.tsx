import OcMappingForm from "@/components/ocMapping/ocMappingForm";
import OcMappingList from "@/components/ocMapping/ocMappingList";
import { useState } from "react";

const OcMappingPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mappingId, setMappingId] = useState("");

  return isFormOpen ? (
    <OcMappingForm
      handleCancel={() => {
        setIsFormOpen(false);
        setMappingId("");
      }}
      mappingId={mappingId}
    />
  ) : (
    <OcMappingList
      handleAdd={() => {
        setIsFormOpen(true);
        setMappingId("");
      }}
      handleEdit={(id: string) => {
        setIsFormOpen(true);
        setMappingId(id);
      }}
    />
  );
};

export default OcMappingPage;
