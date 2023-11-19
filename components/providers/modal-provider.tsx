"use client";

import { useEffect, useState } from "react";

import {
  CreateChannelModal,
  CreateServerModal,
  DeleteChannelModal,
  DeleteServerModal,
  InviteModal,
  LeaveServerModal,
  MembersModal,
  ServerSettingsModal,
  EditChannelModal
} from "@/components/modals";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <ServerSettingsModal />
      <MembersModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
    </>
  );
};
