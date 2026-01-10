import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { JobApplication, Platform, EmploymentType, ApplicationStatus } from '@/types/application';
import { useToast } from '@/hooks/use-toast';

interface DbApplication {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  platform: string;
  location: string;
  employment_type: string;
  date_applied: string;
  status: string;
  job_url: string | null;
  contact_name: string | null;
  contact_email: string | null;
  follow_up_due_date: string | null;
  next_action: string | null;
  salary_range: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbToApp(db: DbApplication): JobApplication {
  return {
    id: db.id,
    jobTitle: db.job_title,
    company: db.company,
    platform: db.platform as Platform,
    location: db.location,
    employmentType: db.employment_type as EmploymentType,
    dateApplied: db.date_applied,
    status: db.status as ApplicationStatus,
    jobUrl: db.job_url ?? undefined,
    contactName: db.contact_name ?? undefined,
    contactEmail: db.contact_email ?? undefined,
    followUpDueDate: db.follow_up_due_date ?? undefined,
    nextAction: db.next_action ?? undefined,
    salaryRange: db.salary_range ?? undefined,
    notes: db.notes ?? undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

export function useApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    if (!user) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setApplications((data || []).map(mapDbToApp));
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load applications.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const addApplication = useCallback(async (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_title: app.jobTitle,
          company: app.company,
          platform: app.platform,
          location: app.location,
          employment_type: app.employmentType,
          date_applied: app.dateApplied,
          status: app.status,
          job_url: app.jobUrl || null,
          contact_name: app.contactName || null,
          contact_email: app.contactEmail || null,
          follow_up_due_date: app.followUpDueDate || null,
          next_action: app.nextAction || null,
          salary_range: app.salaryRange || null,
          notes: app.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newApp = mapDbToApp(data);
      setApplications(prev => [newApp, ...prev]);
      
      toast({
        title: 'Application added',
        description: `${app.jobTitle} at ${app.company} has been added.`,
      });
      
      return newApp;
    } catch (error) {
      console.error('Error adding application:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add application.',
      });
      return null;
    }
  }, [user, toast]);

  const updateApplication = useCallback(async (id: string, updates: Partial<JobApplication>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.jobTitle !== undefined) dbUpdates.job_title = updates.jobTitle;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.employmentType !== undefined) dbUpdates.employment_type = updates.employmentType;
      if (updates.dateApplied !== undefined) dbUpdates.date_applied = updates.dateApplied;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.jobUrl !== undefined) dbUpdates.job_url = updates.jobUrl || null;
      if (updates.contactName !== undefined) dbUpdates.contact_name = updates.contactName || null;
      if (updates.contactEmail !== undefined) dbUpdates.contact_email = updates.contactEmail || null;
      if (updates.followUpDueDate !== undefined) dbUpdates.follow_up_due_date = updates.followUpDueDate || null;
      if (updates.nextAction !== undefined) dbUpdates.next_action = updates.nextAction || null;
      if (updates.salaryRange !== undefined) dbUpdates.salary_range = updates.salaryRange || null;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

      const { error } = await supabase
        .from('job_applications')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
        )
      );

      toast({
        title: 'Application updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update application.',
      });
    }
  }, [toast]);

  const deleteApplication = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== id));
      
      toast({
        title: 'Application deleted',
        description: 'The application has been removed.',
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete application.',
      });
    }
  }, [toast]);

  const exportToCSV = useCallback(() => {
    const headers = [
      'Job Title', 'Company', 'Platform', 'Location', 'Employment Type',
      'Date Applied', 'Status', 'Job URL', 'Contact Name', 'Contact Email',
      'Follow-up Due', 'Next Action', 'Salary Range', 'Notes'
    ];
    
    const rows = applications.map(app => [
      app.jobTitle,
      app.company,
      app.platform,
      app.location,
      app.employmentType,
      app.dateApplied,
      app.status,
      app.jobUrl || '',
      app.contactName || '',
      app.contactEmail || '',
      app.followUpDueDate || '',
      app.nextAction || '',
      app.salaryRange || '',
      app.notes?.replace(/"/g, '""') || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [applications]);

  return {
    applications,
    isLoading,
    addApplication,
    updateApplication,
    deleteApplication,
    exportToCSV,
    refetch: fetchApplications,
  };
}
