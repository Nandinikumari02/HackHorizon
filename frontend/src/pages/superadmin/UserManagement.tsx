import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users, Search, Plus, MoreHorizontal,  Trash2, Mail, Phone, Lock, Eye, EyeOff, Copy, CheckCircle2, ShieldCheck, Loader2, 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { departmentService } from '@/services/departmentService';
import { authService } from '@/services/authService'; // ✅ authService use karein
import api from '@/services/api';

interface DeptAdmin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  departmentName?: string;
  departmentId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<DeptAdmin[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeptAdmin | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<any | null>(null);

  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const deptsRes = await departmentService.getAllDepartments();
      const departments = deptsRes.data;
      setAvailableDepartments(departments);

      let allAdmins: DeptAdmin[] = [];
      for (const dept of departments) {
        const res = await departmentService.getDepartmentAdmins(dept.id);
        const formatted = res.data.map((admin: any) => ({
          id: admin.user.id,
          name: admin.user.fullname,
          email: admin.user.email,
          phone: admin.user.phoneNumber,
          departmentName: dept.name,
          departmentId: dept.id,
          status: "active",
          createdAt: admin.user.createdAt || new Date().toISOString(),
        }));
        allAdmins.push(...formatted);
      }
      setAdmins(allAdmins);
    } catch (error: any) {
      toast({ title: "Sync Failed", description: "Could not load data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setNewFullName(''); setNewEmail(''); setNewPhone('');
    setNewPassword(''); setNewDepartment(''); setShowPassword(false);
  };

  const handleAddAdmin = async () => {
    // 1. Validation logic
    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim() || !newDepartment) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 2. Exact Payload matching your Backend controller
      const payload = {
        fullname: newFullName.trim(),
        email: newEmail.trim(),
        phoneNumber: newPhone.trim() || "", // Empty string if not provided
        password: newPassword,
        departmentId: newDepartment,
        role: 'DEPARTMENT_ADMIN', // Must match Enum
      };

      // 3. Using authService for consistent API calls
      await authService.createInternalUser(payload);

      setCreatedCredentials({
        name: payload.fullname,
        email: payload.email,
        password: payload.password,
        department: availableDepartments.find(d => d.id === newDepartment)?.name || "Assigned Dept",
      });

      toast({ title: 'Success', description: 'Department Admin created successfully' });
      setIsAddDialogOpen(false);
      resetForm();
      fetchData(); 
    } catch (error: any) {
      // 4. Detailed Error Debugging
      console.error("DEBUG_ADD_ADMIN_ERROR:", error.response?.data);
      
      const serverError = error.response?.data?.error || error.response?.data?.message;
      
      toast({
        title: "Creation Failed",
        description: serverError || "Check if email/phone already exists or if fields are valid.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (Baki functions like handleDeleteAdmin and getInitials same rahenge)

  const handleDeleteAdmin = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      toast({ title: 'Deleted', description: 'Admin removed successfully', variant: 'destructive' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: "Action failed", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0]?.toUpperCase() || 'A';
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (admin.departmentName && admin.departmentName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    totalAdmins: admins.length,
    activeDepts: new Set(admins.map((a) => a.departmentId)).size,
  };

  return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Department Admins
            </h1>
            <p className="text-muted-foreground mt-1">Manage HOD accounts and department access.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Dept Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>Link a user to a specific government department.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Full Name *</Label>
                  <Input placeholder="e.g. Rajesh Kumar" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Email Address *</Label>
                  <Input type="email" placeholder="rajesh@gov.in" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input placeholder="+91 98765 43210" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1"><Lock className="h-3 w-3"/> Password *</Label>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Assign Department *</Label>
                  <Select value={newDepartment} onValueChange={setNewDepartment}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddAdmin} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Success Modal */}
        <Dialog open={!!createdCredentials} onOpenChange={() => setCreatedCredentials(null)}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" /> Account Created
              </DialogTitle>
            </DialogHeader>
            {createdCredentials && (
              <div className="space-y-4 py-4">
                <div className="bg-muted rounded-lg p-4 space-y-2 font-mono text-sm border">
                  <div className="flex justify-between border-b pb-1"><span>Dept:</span><span className="font-bold">{createdCredentials.department}</span></div>
                  <div className="flex justify-between border-b pb-1"><span>User:</span><span className="font-bold">{createdCredentials.email}</span></div>
                  <div className="flex justify-between"><span>Pass:</span><span className="font-bold">{createdCredentials.password}</span></div>
                </div>
                <Button className="w-full gap-2" variant="secondary" onClick={() => {
                  navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nPass: ${createdCredentials.password}`);
                  toast({ title: 'Copied!' });
                }}>
                  <Copy className="h-4 w-4" /> Copy Login Info
                </Button>
              </div>
            )}
            <DialogFooter><Button onClick={() => setCreatedCredentials(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search */}
        <Card className="border-none shadow-sm">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter by name, email or department..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50" />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Fetching administrators...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Admin Identity</TableHead>
                    <TableHead>Contact Detail</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(admin.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{admin.name}</span>
                            <span className="text-[10px] text-muted-foreground">Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs gap-1">
                          <span className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" /> {admin.email}</span>
                          {admin.phone && <span className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {admin.phone}</span>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{admin.departmentName}</Badge></TableCell>
                      <TableCell><Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setDeleteTarget(admin)}>
                              <Trash2 className="h-4 w-4 text-destructive" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Confirm Deletion</DialogTitle>
              <DialogDescription>Are you sure you want to remove <strong>{deleteTarget?.name}</strong>?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAdmin}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}