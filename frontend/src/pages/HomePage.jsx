import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AppShell from "../components/layout/AppShell";
import { fetchAccounts, selectAccountsStatus } from "../store/accountsSlice";

import AccountsTab from "./home/AccountsTab";
import TransferTab from "./home/TransferTab";
import CreateAccountTab from "./home/CreateAccountTab";

export default function HomePage() {
  const dispatch = useDispatch();
  const accountsStatus = useSelector(selectAccountsStatus);
  const [activeTab, setActiveTab] = useState("accounts");

  // Only hits the backend the first time this page is visited in a session
  // (status starts "idle"). Switching tabs back and forth afterwards reads
  // from the already-loaded Redux cache instead of re-querying every time.
  useEffect(() => {
    if (accountsStatus === "idle") {
      dispatch(fetchAccounts());
    }
  }, [accountsStatus, dispatch]);

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "accounts" && <AccountsTab />}
      {activeTab === "transfer" && <TransferTab onSwitchToCreate={() => setActiveTab("create")} />}
      {activeTab === "create" && <CreateAccountTab onCreated={() => setActiveTab("accounts")} />}
    </AppShell>
  );
}
