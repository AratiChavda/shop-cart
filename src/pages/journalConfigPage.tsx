import JournalConfigForm from "@/components/journalConfig/journalConfigForm";
import JournalConfigList from "@/components/journalConfig/journalConfigList";
import { useState } from "react";

const JournalConfigPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [configId, setConfigId] = useState("");

  return isFormOpen ? (
    <JournalConfigForm
      handleCancel={() => {
        setIsFormOpen(false);
        setConfigId("");
      }}
      configId={configId}
    />
  ) : (
    <JournalConfigList
      handleAddConfiguration={() => {
        setIsFormOpen(true);
        setConfigId("");
      }}
      handleEdit={(id: string) => {
        setIsFormOpen(true);
        setConfigId(id);
      }}
    />
  );
};

export default JournalConfigPage;
