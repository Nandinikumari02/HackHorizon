import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UserPlus, Loader2, Search, Phone, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { authService } from '@/services/authService'; 
import { departmentService } from '@/services/departmentService';

interface AddStaffDialogProps {
  departmentId: string;
  onSuccess: () => void;
}

export function AddStaffDialog({ departmentId, onSuccess }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  
  // Form State
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('');
  
  const { toast } = useToast();

  // Roles abhi bhi departmentService se hi aayenge
  useEffect(() => {
    const fetchDeptDetails = async () => {
      try {
        const response = await departmentService.getMyStaff();
        const apiData = response.data || response;
        setRoles(apiData.supportedRoles || []);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    if (open) fetchDeptDetails();
  }, [open]);

  const handleAddStaff = async () => {
    if (!fullname || !email || !phoneNumber || !password || !designation) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill all details." });
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Sahi Service Call: authService use kar rahe hain
      await authService.createInternalUser({
        fullname,
        email,
        phoneNumber,
        password,
        designation,
        role: 'STAFF', // Department Admin sirf Staff bana sakta hai
        departmentId
      });

      toast({ title: "Staff Created", description: "New staff member added successfully." });
      
      // Reset Form
      setFullname('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setDesignation('');
      
      setOpen(false);
      onSuccess(); 
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Creation Error", 
        description: error.response?.data?.error || "Could not create staff member." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-md bg-primary hover:bg-primary/90">
          <UserPlus className="h-4 w-4" /> Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold ">Add Team Member</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold  text-muted-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
              <Input 
                placeholder="Ex: Rajesh Kumar" 
                className="pl-9"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold  text-muted-foreground">Email Address</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
              <Input 
                type="email"
                placeholder="staff@department.gov" 
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold  text-muted-foreground">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                <Input 
                  placeholder="98765..." 
                  className="pl-9"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold  text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold  text-muted-foreground">Designation / Role</label>
            <Select value={designation} onValueChange={setDesignation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={roles.length > 0 ? "Select a role" : "No roles found"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full mt-4 " 
            onClick={handleAddStaff} 
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Staff Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}