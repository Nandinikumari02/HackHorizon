import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Tag, Loader2 } from 'lucide-react';

/* ✅ SERVICE & AUTH INTEGRATION */
import { departmentService } from '@/services/departmentService';
import { useAuth } from '@/contexts/AuthContext';

interface AddCategoryDialogProps {
  onSuccess?: () => void; 
}

export function AddCategoryDialog({ onSuccess }: AddCategoryDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

const handleSubmit = async () => {
  if (!name.trim()) {
    toast({ title: 'Category name is required', variant: 'destructive' });
    return;
  }

  // Derive departmentId from authenticated department admin record
  const deptId =
    user?.departmentAdmin?.departmentId ??
    user?.departmentAdmin?.department?.id ??
    user?.departmentId ??
    user?.department?.id;

  if (!deptId) {
    toast({ 
      title: 'Department ID missing', 
      description: "Please re-login or check permissions.",
      variant: 'destructive' 
    });
    return;
  }

  try {
    setLoading(true);
    
    await departmentService.createCategory({
      name: name.trim(),
      departmentId: deptId // ✅ Ab red line nahi aayegi
    });

    toast({
      title: 'Success',
      description: `New category "${name}" added successfully.`,
    });

    setName('');
    setOpen(false);
    if (onSuccess) onSuccess();

  } catch (error: any) {
    // ... error handling
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 shadow-sm font-semibold">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Tag className="h-5 w-5 text-primary" />
            New Category
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              disabled={loading}
              placeholder="e.g. Pipe Leakage, Garbage Collection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-visible:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground italic">
              * This category will be visible to citizens in the report form.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Save Category'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}