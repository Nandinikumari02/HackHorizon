import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface EmptyTaskStateProps {
  message?: string;
  subtitle?: string;
}

export function EmptyTaskState({ 
  message = "All caught up!", 
  subtitle = "No pending tasks at the moment" 
}: EmptyTaskStateProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center flex flex-col items-center justify-center">
        <CheckCircle2 className="h-12 w-12 text-success mb-3" />
        <p className="font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}