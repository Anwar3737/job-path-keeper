import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  JobApplication,
  ApplicationStatus,
  STATUS_CONFIG,
  PLATFORM_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  Platform,
  EmploymentType,
} from '@/types/application';

interface ApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: JobApplication | null;
  onSave: (data: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const initialFormData = {
  jobTitle: '',
  company: '',
  platform: 'linkedin' as Platform,
  location: '',
  employmentType: 'full-time' as EmploymentType,
  dateApplied: new Date().toISOString().split('T')[0],
  jobUrl: '',
  status: 'applied' as ApplicationStatus,
  lastContactDate: '',
  followUpDueDate: '',
  nextAction: '',
  contactName: '',
  contactEmail: '',
  contactLinkedIn: '',
  notes: '',
  salaryRange: '',
  keyRequirements: '',
};

export function ApplicationModal({ open, onOpenChange, application, onSave }: ApplicationModalProps) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (application) {
      setFormData({
        jobTitle: application.jobTitle,
        company: application.company,
        platform: application.platform,
        location: application.location,
        employmentType: application.employmentType,
        dateApplied: application.dateApplied,
        jobUrl: application.jobUrl || '',
        status: application.status,
        lastContactDate: application.lastContactDate || '',
        followUpDueDate: application.followUpDueDate || '',
        nextAction: application.nextAction || '',
        contactName: application.contactName || '',
        contactEmail: application.contactEmail || '',
        contactLinkedIn: application.contactLinkedIn || '',
        notes: application.notes || '',
        salaryRange: application.salaryRange || '',
        keyRequirements: application.keyRequirements || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [application, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {application ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Senior Software Engineer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Google"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value: Platform) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value: EmploymentType) => setFormData({ ...formData, employmentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ApplicationStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateApplied">Date Applied</Label>
              <Input
                id="dateApplied"
                type="date"
                value={formData.dateApplied}
                onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input
              id="jobUrl"
              type="url"
              value={formData.jobUrl}
              onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Follow-up Section */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-3">Follow-up & Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastContactDate">Last Contact Date</Label>
                <Input
                  id="lastContactDate"
                  type="date"
                  value={formData.lastContactDate}
                  onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUpDueDate">Follow-up Due Date</Label>
                <Input
                  id="followUpDueDate"
                  type="date"
                  value={formData.followUpDueDate}
                  onChange={(e) => setFormData({ ...formData, followUpDueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="nextAction">Next Action</Label>
              <Input
                id="nextAction"
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                placeholder="Follow-up email, Interview prep, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactLinkedIn">Contact LinkedIn</Label>
                <Input
                  id="contactLinkedIn"
                  value={formData.contactLinkedIn}
                  onChange={(e) => setFormData({ ...formData, contactLinkedIn: e.target.value })}
                  placeholder="linkedin.com/in/..."
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-3">Notes & Insights</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range</Label>
                <Input
                  id="salaryRange"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                  placeholder="$120,000 - $150,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyRequirements">Key Requirements</Label>
                <Textarea
                  id="keyRequirements"
                  value={formData.keyRequirements}
                  onChange={(e) => setFormData({ ...formData, keyRequirements: e.target.value })}
                  placeholder="5+ years experience, React, TypeScript..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Interview feedback, personal fit notes..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {application ? 'Save Changes' : 'Add Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
