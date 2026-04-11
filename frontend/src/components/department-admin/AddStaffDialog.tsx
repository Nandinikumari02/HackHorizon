import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/** Placeholder: legacy department UI; real staff are created via `POST /api/auth/create-staff`. */
export function AddStaffDialog({
  departmentId,
  onSuccess,
}: {
  departmentId: string;
  onSuccess: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" disabled={!departmentId}>
          Add staff
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add department staff</DialogTitle>
          <DialogDescription>
            This screen is not wired to the current backend. Use{' '}
            <code className="text-xs bg-muted px-1 rounded">POST /api/auth/create-staff</code> with role{' '}
            <code className="text-xs bg-muted px-1 rounded">WASTE_STAFF</code> from an admin or recycling partner
            account.
          </DialogDescription>
        </DialogHeader>
        <Button variant="secondary" onClick={() => onSuccess()}>
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
}
