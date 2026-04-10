import { useState, useEffect } from 'react';
import { CATEGORY_LABELS } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileWarning,
  Search,
  MoreHorizontal,
  Eye,
  UserPlus,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowUpDown,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { issueService } from '@/services/issueService';

export default function AllIssues() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issueService.getAllIssues(); 
      setIssues(response.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch issues from server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = issues
    .filter((issue) => {
      const matchesSearch = 
        (issue.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (issue.location?.address?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      // Backend Status check (supports both lowercase and uppercase from API)
      const currentStatus = issue.status?.toLowerCase();
      const filterStatus = statusFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || currentStatus === filterStatus;
      
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      // Prisma default fields use 'createdAt' instead of 'reportedAt'
      const dateA = new Date(a.createdAt || a.reportedAt).getTime();
      const dateB = new Date(b.createdAt || b.reportedAt).getTime();

      switch (sortBy) {
        case 'newest': return dateB - dateA;
        case 'oldest': return dateA - dateB;
        case 'upvotes': return (b._count?.upvotes || b.upvotes || 0) - (a._count?.upvotes || a.upvotes || 0);
        default: return 0;
      }
    });

  const handleAssign = async (issueId: string) => {
    try {
        await issueService.assignIssue({
            issueId,
            staffId: "some-staff-id"
        });
        toast({ title: 'Success', description: 'Staff assigned successfully.' });
        fetchIssues();
    } catch (error) {
        toast({ title: 'Assignment Failed', variant: 'destructive' });
    }
  };

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status?.toLowerCase() === 'pending' || i.status?.toLowerCase() === 'open').length,
    inProgress: issues.filter(i => i.status?.toLowerCase() === 'in_progress').length,
    resolved: issues.filter(i => i.status?.toLowerCase() === 'resolved').length,
  };

  return (
   
      <div className="space-y-6">
        {/* Header - UI intact */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileWarning className="h-6 w-6 text-primary" />
              All Issues
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all reported issues across the city
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={fetchIssues}>
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats - UI intact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Issues', val: stats.total, color: 'text-primary', icon: FileWarning, filter: 'all' },
            { label: 'Pending', val: stats.pending, color: 'text-orange-500', icon: Clock, filter: 'pending' },
            { label: 'In Progress', val: stats.inProgress, color: 'text-blue-500', icon: RefreshCw, filter: 'in_progress' },
            { label: 'Resolved', val: stats.resolved, color: 'text-green-500', icon: CheckCircle2, filter: 'resolved' },
          ].map((stat) => (
            <Card key={stat.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(stat.filter)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.val}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters - UI intact */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[130px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="upvotes">Most Upvotes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table - UI intact */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Issues ({filteredIssues.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Issue</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue) => (
                    <TableRow key={issue.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {issue.media?.[0]?.url ? (
                            <img src={issue.media[0].url} className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><FileWarning className="h-5 w-5 text-muted-foreground" /></div>
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">{issue.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{issue.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><CategoryBadge category={issue.category} /></TableCell>
                      <TableCell><StatusBadge status={issue.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1 max-w-[150px]">{issue.location?.address || 'No Address'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {issue.createdAt ? format(new Date(issue.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer"><Eye className="h-4 w-4" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleAssign(issue.id)}><UserPlus className="h-4 w-4" /> Assign Staff</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-green-600 cursor-pointer"><CheckCircle2 className="h-4 w-4" /> Resolve</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredIssues.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No issues found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}