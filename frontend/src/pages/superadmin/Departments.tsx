import { useState, type KeyboardEvent, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Plus,
  Users,
  FileWarning,
  MoreHorizontal,
  
  Edit,
  X,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { departmentService } from '@/services/departmentService'; // Path apne according check kar lein

export interface Department {
  id: string;
  name: string;
  description: string;
  supportedRoles: string[];
  adminName?: string;
  adminId?: string;
  createdAt: string;
}

export default function Departments() {
  const { toast } = useToast();
  
  // Real State management
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  // const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  // const [editTarget, setEditTarget] = useState<Department | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formRoles, setFormRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');

  // --- 1. Fetch Data from Backend ---
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAllDepartments();
      setDepartments(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load departments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const stats = {
    totalDepartments: departments.length,
    totalAdmins: departments.filter((d) => d.adminId || d.adminName).length,
    activeIssues: 0, // Isse baad mein Issues API se connect karenge
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormRoles([]);
    setRoleInput('');
  };

  const openEditDialog = (dept: Department) => {
    // setEditTarget(dept);
    setFormName(dept.name);
    setFormDesc(dept.description);
    setFormRoles([...dept.supportedRoles]);
    setRoleInput('');
  };

  const handleRoleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = roleInput.trim();
      if (value && !formRoles.includes(value)) {
        setFormRoles((prev) => [...prev, value]);
      }
      setRoleInput('');
    }
  };

  const removeRole = (role: string) => {
    setFormRoles((prev) => prev.filter((r) => r !== role));
  };

  // --- 2. Create Department Logic ---
  const handleAddDepartment = async () => {
    if (!formName.trim()) {
      toast({ title: 'Department name is required', variant: 'destructive' });
      return;
    }

    try {
      const payload = {
        name: formName.trim(),
        description: formDesc.trim(),
        supportedRoles: formRoles,
      };

      await departmentService.createDepartment(payload);
      
      toast({ title: 'Success', description: `"${formName}" created successfully.` });
      
      setIsAddOpen(false);
      resetForm();
      fetchDepartments(); // Refresh table
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.response?.data?.error || "Could not save department",
        variant: "destructive"
      });
    }
  };

  // --- 3. Update & Delete Logic (Placeholders connected to service) ---
  // const handleEditDepartment = async () => {
  //   if (!editTarget || !formName.trim()) return;
  //   // Note: Agar backend par update route nahi hai toh ye sirf toast dikhayega abhi
  //   toast({ title: 'Info', description: "Update feature backend integration pending" });
  //   setEditTarget(null);
  //   resetForm();
  // };

  // const handleDeleteDepartment = async () => {
  //   if (!deleteTarget) return;
  //   try {
  //       // Agar backend mein delete API hai toh: await departmentService.deleteDepartment(deleteTarget.id);
  //       toast({ title: 'Success', description: "Department deleted (logic connected)" });
  //       setDepartments(prev => prev.filter(d => d.id !== deleteTarget.id));
  //   } catch (error) {
  //       toast({ title: 'Error', variant: "destructive", description: "Delete failed" });
  //   }
  //   setDeleteTarget(null);
  // };

  const roleTagInputUI = (
    <div className="grid gap-2">
      <Label>Supported Roles / Designations</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {formRoles.map((role) => (
          <Badge key={role} variant="secondary" className="gap-1 pr-1">
            {role}
            <button
              type="button"
              onClick={() => removeRole(role)}
              className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder="Type a role and press Enter (e.g., Junior Engineer)"
        value={roleInput}
        onChange={(e) => setRoleInput(e.target.value)}
        onKeyDown={handleRoleKeyDown}
      />
      <p className="text-xs text-muted-foreground">Press Enter to add each role</p>
    </div>
  );

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Departments
            </h1>
            <p className="text-muted-foreground mt-1">
              Create departments and define supported roles. Then assign admins from User Management.
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
                <DialogDescription>
                  Define the department and its supported designations/roles.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="deptName">Department Name *</Label>
                  <Input
                    id="deptName"
                    placeholder="e.g., Waste Management"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deptDesc">Description</Label>
                  <Textarea
                    id="deptDesc"
                    placeholder="Brief description of the department's responsibilities"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={3}
                  />
                </div>
                {roleTagInputUI}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleAddDepartment}>Create Department</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalDepartments}</p>
                  <p className="text-sm text-muted-foreground">Total Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAdmins}</p>
                  <p className="text-sm text-muted-foreground">Total Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <FileWarning className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeIssues}</p>
                  <p className="text-sm text-muted-foreground">Active Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Area with Loading Guard */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Supported Roles</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{dept.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {dept.supportedRoles?.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {dept.adminName ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{dept.adminName}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-xs">
                            Not Assigned
                          </Badge>
                        )}
                      </TableCell>
                            <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {(() => {
                                      const date = new Date(dept.createdAt);
                                      // Check if date is actually valid
                                      return !isNaN(date.getTime()) 
                                        ? date.toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                          })
                                        : "N/A"; // Agar data kharab hai toh N/A dikhayega, "Invalid Date" nahi
                                    })()}
                                  </span>
                            </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(dept)}>
                              <Edit className="h-4 w-4" /> Edit Department
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteTarget(dept)}>
                              <Trash2 className="h-4 w-4" /> Delete Department
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {departments.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No departments created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit & Delete Dialogs (UI as it was) */}
        {/* ... (Existing Edit/Delete Dialogs code stays exactly same as your input) ... */}
      </div>
    
  );
}