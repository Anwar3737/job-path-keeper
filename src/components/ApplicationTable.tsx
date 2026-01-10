import { useState } from 'react';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from './StatusBadge';
import { JobApplication, PLATFORM_OPTIONS } from '@/types/application';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationTableProps {
  applications: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
}

export function ApplicationTable({ applications, onEdit, onDelete }: ApplicationTableProps) {
  const today = startOfDay(new Date());

  const isOverdue = (followUpDate?: string) => {
    if (!followUpDate) return false;
    return isBefore(parseISO(followUpDate), today);
  };

  const isDueSoon = (followUpDate?: string) => {
    if (!followUpDate) return false;
    const date = parseISO(followUpDate);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return isAfter(date, today) && isBefore(date, threeDaysFromNow);
  };

  const getPlatformLabel = (platform: string) => {
    return PLATFORM_OPTIONS.find(p => p.value === platform)?.label || platform;
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-xl border border-border">
        <div className="text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm mt-1">Start tracking your job search by adding your first application</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Job</TableHead>
              <TableHead className="font-semibold">Company</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Platform</TableHead>
              <TableHead className="font-semibold">Applied</TableHead>
              <TableHead className="font-semibold">Follow-up</TableHead>
              <TableHead className="font-semibold">Next Action</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow 
                key={app.id} 
                className={cn(
                  'hover:bg-muted/30 transition-colors',
                  isOverdue(app.followUpDueDate) && 'bg-destructive/5'
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {app.jobTitle}
                    {app.jobUrl && (
                      <a 
                        href={app.jobUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{app.location}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{app.company}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.status} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {getPlatformLabel(app.platform)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(parseISO(app.dateApplied), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {app.followUpDueDate ? (
                    <div className={cn(
                      'flex items-center gap-1.5 text-sm',
                      isOverdue(app.followUpDueDate) && 'text-destructive font-medium',
                      isDueSoon(app.followUpDueDate) && 'text-warning font-medium'
                    )}>
                      {isOverdue(app.followUpDueDate) && (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {format(parseISO(app.followUpDueDate), 'MMM d')}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">
                  {app.nextAction || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(app)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(app.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
