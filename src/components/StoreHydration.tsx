"use client";

import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";

export function StoreHydration() {
  useEffect(() => {
    useChatStore.persist.rehydrate();
  }, []);

  return null;
}
