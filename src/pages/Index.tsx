import { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, parseISO, isWithinInterval, isBefore, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { ApplicationTable } from '@/components/ApplicationTable';
import { ApplicationModal } from '@/components/ApplicationModal';
import { FilterBar } from '@/components/FilterBar';
import { useApplications } from '@/hooks/useApplications';
import { JobApplication, ApplicationStatus } from '@/types/application';
import { 
  Plus, 
  Download, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const Index = () => {
  const { applications, addApplication, updateApplication, deleteApplication, exportToCSV } = useApplications();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState('all');

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const stats = useMemo(() => {
    const thisWeekApplied = applications.filter(app => {
      const date = parseISO(app.dateApplied);
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    }).length;

    const inProgress = applications.filter(app => 
      ['screening', 'interview1', 'interview2'].includes(app.status)
    ).length;

    const offers = applications.filter(app => app.status === 'offer').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    
    const overdueFollowUps = applications.filter(app => {
      if (!app.followUpDueDate) return false;
      return isBefore(parseISO(app.followUpDueDate), today) && 
             !['rejected', 'withdrawn', 'offer'].includes(app.status);
    }).length;

    return { thisWeekApplied, inProgress, offers, rejected, overdueFollowUps };
  }, [applications, weekStart, weekEnd, today]);

  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => {
        const matchesSearch = !search || 
          app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
          app.company.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchesPlatform = platformFilter === 'all' || app.platform === platformFilter;
        return matchesSearch && matchesStatus && matchesPlatform;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [applications, search, statusFilter, platformFilter]);

  const handleSave = (data: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingApp) {
      updateApplication(editingApp.id, data);
    } else {
      addApplication(data);
    }
    setEditingApp(null);
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApp(app);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteApplication(id);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPlatformFilter('all');
  };

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || platformFilter !== 'all';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                Job Tracker
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track your applications and stay organized
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button size="sm" onClick={() => { setEditingApp(null); setModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Application
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Applied This Week"
            value={stats.thisWeekApplied}
            icon={TrendingUp}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            iconClassName="bg-violet-100 text-violet-600"
          />
          <StatsCard
            title="Offers"
            value={stats.offers}
            icon={CheckCircle2}
            iconClassName="bg-emerald-100 text-emerald-600"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            iconClassName="bg-red-100 text-red-600"
          />
          <StatsCard
            title="Overdue Follow-ups"
            value={stats.overdueFollowUps}
            icon={AlertTriangle}
            iconClassName={stats.overdueFollowUps > 0 ? "bg-amber-100 text-amber-600" : "bg-muted text-muted-foreground"}
          />
        </div>

        {/* Filter Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          platformFilter={platformFilter}
          onPlatformFilterChange={setPlatformFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Applications Table */}
        <ApplicationTable
          applications={filteredApplications}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Total Count */}
        <p className="text-sm text-muted-foreground text-center">
          Showing {filteredApplications.length} of {applications.length} applications
        </p>
      </main>

      {/* Application Modal */}
      <ApplicationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        application={editingApp}
        onSave={handleSave}
      />
    </div>
  );
};

export default Index;
