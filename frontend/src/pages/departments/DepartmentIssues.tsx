import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  FileWarning, Filter, MapPin, Search, 
  Loader2, RefreshCcw, Calendar, Tag 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

// Custom Components
import { AssignStaffDialog } from "@/components/department-admin/AssignStaffDialog";
import { IssueDetailsDialog } from "@/components/department-admin/IssueDetailsDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";

// Services
import { issueService } from '@/services/wasteService';
import { departmentService } from '@/services/departmentService';

export default function DepartmentIssues() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [issues, setIssues] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // ✅ Added for silent refresh
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');

  const deptName = user?.departmentAdmin?.department?.name || user?.department?.name || "Department";

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      // ✅ Logic: Full loading screen only on first load
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);

      const [issuesRes, staffRes] = await Promise.all([
        issueService.getDeptIssues(),
        departmentService.getMyStaff()
      ]);
      setIssues(issuesRes.data || []);
      setStaff(staffRes.data || []);
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: "Could not load data from server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredIssues = issues.filter((issue) => {
    const searchTerm = searchQuery.toLowerCase();
    const titleMatch = issue.title?.toLowerCase().includes(searchTerm);
    const addressMatch = issue.address?.toLowerCase().includes(searchTerm);
    const categoryName = typeof issue.category === 'object' ? issue.category.name : issue.category;
    const categoryMatch = categoryName?.toLowerCase().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return (titleMatch || addressMatch || categoryMatch) && matchesStatus;
  });

  const pendingIssues = filteredIssues.filter((i) => ['OPEN', 'SUBMITTED'].includes(i.status));
  const inProgressIssues = filteredIssues.filter((i) => i.status === 'IN_PROGRESS');
  const resolvedIssues = filteredIssues.filter((i) => i.status === 'RESOLVED');

  const IssueTable = ({ issuesList }: { issuesList: any[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="text-xs font-medium text-muted-foreground">Issue</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Category</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Reported</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Assigned to</TableHead>
            <TableHead className="text-right text-xs font-medium text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issuesList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                No issues found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            issuesList.map((issue) => (
              <TableRow key={issue.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="max-w-[280px] space-y-1">
                    <p className="font-semibold text-sm truncate">{issue.title}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{issue.address || "GPS Location"}</span>
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={issue.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium bg-primary/5 text-primary border border-primary/10 px-2.5 py-1 rounded-full w-fit">
                    <Tag className="h-3 w-3" /> 
                    {typeof issue.category === 'object' ? issue.category.name : (issue.category || "General")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {issue.createdAt ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true }) : "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {issue.staff?.user ? (
                      <span className="text-xs font-medium">{issue.staff.user.fullname}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <IssueDetailsDialog issue={issue} />
                    {['OPEN', 'SUBMITTED'].includes(issue.status) && (
                      <AssignStaffDialog
                        issue={issue}
                        staff={staff}
                        onSuccess={() => fetchData(true)}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // ✅ Show full loader only for initial fetch
  if (loading && !isRefreshing) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Accessing {deptName} sector records...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
            <FileWarning className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Department issues
            </h1>
            <p className="text-muted-foreground">
              Operational queue for <strong>{deptName}</strong> department.
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => fetchData(true)} 
          disabled={isRefreshing}
          className="gap-2 shadow-sm h-9"
        >
          <RefreshCcw className={cn("h-4 w-4 transition-all", isRefreshing ? "opacity-30" : "opacity-100")} /> 
          Synchronize
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-muted/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, address, or category tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/20"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-muted/20">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">New / Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">Active Work</SelectItem>
                <SelectItem value="RESOLVED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Interface */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4 bg-muted/30 p-1 rounded-lg w-fit">
          <TabsList className="bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:shadow-sm">
              All <span className="ml-2 opacity-50 text-[10px]">{filteredIssues.length}</span>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending <span className="ml-2 opacity-50 text-[10px]">{pendingIssues.length}</span>
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              Active <span className="ml-2 opacity-50 text-[10px]">{inProgressIssues.length}</span>
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved <span className="ml-2 opacity-50 text-[10px]">{resolvedIssues.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <Card className="border-muted/60 shadow-lg">
          <CardContent className="p-0">
            <TabsContent value="all" className="m-0">
              <IssueTable issuesList={filteredIssues} />
            </TabsContent>
            <TabsContent value="pending" className="m-0">
              <IssueTable issuesList={pendingIssues} />
            </TabsContent>
            <TabsContent value="in_progress" className="m-0">
              <IssueTable issuesList={inProgressIssues} />
            </TabsContent>
            <TabsContent value="resolved" className="m-0">
              <IssueTable issuesList={resolvedIssues} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}