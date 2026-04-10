import { useState, useEffect, useCallback } from 'react';
import { ReportIssueDialog } from "@/components/citizen/ReportIssueDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileWarning, Loader2, SearchX } from "lucide-react";
import { IssueCard } from "@/components/citizen/IssueCard";
import { issueService } from "@/services/issueService"; // Service Import

export default function IssueFeed() {
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Real Data
  const fetchIssues = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await issueService.getAllIssues(); // Ya service.getAllIssues()
      setIssues(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  
  const pendingIssues = issues.filter((i) => i.status === 'OPEN' || i.status === 'PENDING');
  const inProgressIssues = issues.filter((i) => i.status === 'IN_PROGRESS');
  const resolvedIssues = issues.filter((i) => i.status === 'RESOLVED');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileWarning className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Issue Feed</h1>
            <p className="text-muted-foreground text-sm">
              Browse and track all civic issues in your area
            </p>
          </div>
        </div>
        <ReportIssueDialog onRefresh={fetchIssues} />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
          <p className="mt-4 text-muted-foreground font-medium">Loading feed...</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-muted/50 p-1">
            <TabsTrigger value="all" className="relative">
              All Issues
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full">{issues.length}</span>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-yellow-500/10 text-yellow-600 rounded-full">{pendingIssues.length}</span>
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-blue-500/10 text-blue-600 rounded-full">{inProgressIssues.length}</span>
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-green-500/10 text-green-600 rounded-full">{resolvedIssues.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* Render Function to avoid repeating code */}
          {["all", "pending", "in_progress", "resolved"].map((tab) => {
            const list = 
              tab === "all" ? issues : 
              tab === "pending" ? pendingIssues : 
              tab === "in_progress" ? inProgressIssues : 
              resolvedIssues;

            return (
              <TabsContent key={tab} value={tab} className="space-y-4 outline-none">
                {list.length > 0 ? (
                  list.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} onUpvote={fetchIssues} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-muted/5">
                    <SearchX className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold">No issues found</h3>
                    <p className="text-muted-foreground text-sm">There are no issues in the "{tab}" category.</p>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}