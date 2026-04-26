"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ascenta/ui/dialog";
import { Button } from "@ascenta/ui/button";

interface JdImportStubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JdImportStubDialog({ open, onOpenChange }: JdImportStubDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import</DialogTitle>
          <DialogDescription>
            Coming soon. Upload Word, PDF, or CSV files to extract job descriptions
            automatically. Reach out to support to discuss your import needs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
