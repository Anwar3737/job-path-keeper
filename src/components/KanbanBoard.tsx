import { useMemo } from 'react';
import { JobApplication, ApplicationStatus, STATUS_CONFIG, PLATFORM_OPTIONS } from '@/types/application';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format, parseISO, isBefore, startOfDay, isAfter } from 'date-fns';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  AlertTriangle,
  MapPin,
  Building2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanBoardProps {
  applications: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

const KANBAN_COLUMNS: ApplicationStatus[] = [
  'wishlist',
  'applied',
  'screening',
  'interview1',
  'interview2',
  'offer',
  'rejected',
  'withdrawn',
];

export function KanbanBoard({ applications, onEdit, onDelete, onStatusChange }: KanbanBoardProps) {
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

  const columnData = useMemo(() => {
    return KANBAN_COLUMNS.map(status => ({
      status,
      config: STATUS_CONFIG[status],
      apps: applications.filter(app => app.status === status),
    }));
  }, [applications]);

  const getPlatformLabel = (platform: string) => {
    return PLATFORM_OPTIONS.find(p => p.value === platform)?.label || platform;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {columnData.map(({ status, config, apps }) => (
          <div
            key={status}
            className="w-72 flex-shrink-0 bg-muted/30 rounded-lg border border-border"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border bg-card/50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="text-sm text-muted-foreground font-medium">
                    ({apps.length})
                  </span>
                </div>
              </div>
            </div>

            {/* Column Content */}
            <ScrollArea className="h-[calc(100vh-320px)] min-h-[400px]">
              <div className="p-2 space-y-2">
                {apps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No applications
                  </div>
                ) : (
                  apps.map(app => (
                    <Card
                      key={app.id}
                      className={cn(
                        'p-3 hover:shadow-md transition-shadow cursor-pointer group',
                        isOverdue(app.followUpDueDate) && 'border-destructive/50 bg-destructive/5'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-medium text-sm truncate">{app.jobTitle}</h4>
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                                onClick={e => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            <span className="text-xs truncate">{app.company}</span>
                          </div>
                          {app.location && (
                            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="text-xs truncate">{app.location}</span>
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
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
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {getPlatformLabel(app.platform)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(app.dateApplied), 'MMM d')}
                        </span>
                      </div>

                      {/* Follow-up indicator */}
                      {app.followUpDueDate && (
                        <div
                          className={cn(
                            'flex items-center gap-1 mt-2 text-xs',
                            isOverdue(app.followUpDueDate) && 'text-destructive font-medium',
                            isDueSoon(app.followUpDueDate) && 'text-warning font-medium'
                          )}
                        >
                          {isOverdue(app.followUpDueDate) && <AlertTriangle className="w-3 h-3" />}
                          Follow-up: {format(parseISO(app.followUpDueDate), 'MMM d')}
                        </div>
                      )}

                      {/* Next Action */}
                      {app.nextAction && (
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          → {app.nextAction}
                        </p>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}
