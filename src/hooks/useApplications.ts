import { useState, useEffect, useCallback } from 'react';
import { JobApplication } from '@/types/application';

const STORAGE_KEY = 'job-applications';

export function useApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setApplications(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const saveApplications = useCallback((apps: JobApplication[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    setApplications(apps);
  }, []);

  const addApplication = useCallback((app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApp: JobApplication = {
      ...app,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveApplications([...applications, newApp]);
    return newApp;
  }, [applications, saveApplications]);

  const updateApplication = useCallback((id: string, updates: Partial<JobApplication>) => {
    const updatedApps = applications.map(app =>
      app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
    );
    saveApplications(updatedApps);
  }, [applications, saveApplications]);

  const deleteApplication = useCallback((id: string) => {
    saveApplications(applications.filter(app => app.id !== id));
  }, [applications, saveApplications]);

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
  };
}
