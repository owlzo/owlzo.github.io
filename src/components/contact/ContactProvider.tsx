import { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface ContactOrigin {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ContactState {
  open: boolean;
  origin: ContactOrigin | null;
  openContact: (rect: DOMRect) => void;
  closeContact: () => void;
}

const ContactContext = createContext<ContactState | null>(null);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<ContactOrigin | null>(null);

  const openContact = useCallback((rect: DOMRect) => {
    setOrigin({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setOpen(true);
  }, []);

  const closeContact = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, origin, openContact, closeContact }),
    [open, origin, openContact, closeContact],
  );

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact() {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error("useContact must be used within a ContactProvider");
  }
  return context;
}
