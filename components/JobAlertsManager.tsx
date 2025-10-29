import React, { useState } from 'react';
import { JobSeeker, JobAlertsPreferences, JobType, LocationType } from '../types';
import { BellIcon } from './icons';
import Modal from './Modal';

interface JobAlertsManagerProps {
  seeker: JobSeeker;
  onSave: (updatedSeeker: JobSeeker) => void;
}

const JobAlertsManager: React.FC<JobAlertsManagerProps> = ({ seeker, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleToggleAlerts = (enabled: boolean) => {
    onSave({ ...seeker, jobAlertsEnabled: enabled });
  };

  const handleSavePreferences = (preferences: JobAlertsPreferences) => {
    onSave({ ...seeker, jobAlertsPreferences: preferences });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-interactive">
      <div className="flex items-center mb-4">
        <BellIcon className="h-8 w-8 text-secondary mr-3" />
        <h3 className="text-xl font-bold text-neutral">Get Job Alerts</h3>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Email notifications are <span className={`font-bold ${seeker.jobAlertsEnabled ? 'text-green-600' : 'text-red-600'}`}>{seeker.jobAlertsEnabled ? 'enabled' : 'disabled'}</span>.
        </p>
        <ToggleSwitch
          enabled={seeker.jobAlertsEnabled}
          onChange={handleToggleAlerts}
        />
      </div>
      {seeker.jobAlertsEnabled && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 w-full text-center text-primary font-semibold hover:underline"
        >
          Manage Preferences
        </button>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Job Alert Preferences"
      >
        <PreferencesForm
          initialPreferences={seeker.jobAlertsPreferences}
          onSave={handleSavePreferences}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

// Sub-component for the toggle switch
const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void; }) => (
  <button
    type="button"
    className={`${enabled ? 'bg-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
    role="switch"
    aria-checked={enabled}
    onClick={() => onChange(!enabled)}
  >
    <span
      aria-hidden="true"
      className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

// Sub-component for the preferences form inside the modal
const PreferencesForm = ({ initialPreferences, onSave, onCancel }: { initialPreferences: JobAlertsPreferences; onSave: (prefs: JobAlertsPreferences) => void; onCancel: () => void; }) => {
  const [prefs, setPrefs] = useState(initialPreferences);

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keywords = e.target.value.split(',').map(kw => kw.trim());
    setPrefs(p => ({ ...p, keywords }));
  };

  const handleJobTypeChange = (jobType: JobType) => {
    const newJobTypes = prefs.jobTypes.includes(jobType)
      ? prefs.jobTypes.filter(jt => jt !== jobType)
      : [...prefs.jobTypes, jobType];
    setPrefs(p => ({ ...p, jobTypes: newJobTypes }));
  };

  const handleLocationTypeChange = (locationType: LocationType) => {
    const newLocationTypes = prefs.locationTypes.includes(locationType)
      ? prefs.locationTypes.filter(lt => lt !== locationType)
      : [...prefs.locationTypes, locationType];
    setPrefs(p => ({ ...p, locationTypes: newLocationTypes }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(prefs);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">Matching Keywords (comma-separated)</label>
        <input type="text" name="keywords" id="keywords" defaultValue={prefs.keywords.join(', ')} onChange={handleKeywordsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Job Type</label>
          <div className="mt-2 space-y-2">
            {Object.values(JobType).map(type => (
              <Checkbox key={type} label={type} checked={prefs.jobTypes.includes(type)} onChange={() => handleJobTypeChange(type)} />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location Type</label>
          <div className="mt-2 space-y-2">
            {Object.values(LocationType).map(type => (
              <Checkbox key={type} label={type} checked={prefs.locationTypes.includes(type)} onChange={() => handleLocationTypeChange(type)} />
            ))}
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700">Minimum Salary: ${prefs.minSalary.toLocaleString()}</label>
        <input type="range" id="minSalary" min="0" max="200000" step="10000" value={prefs.minSalary} onChange={(e) => setPrefs(p => ({ ...p, minSalary: Number(e.target.value)}))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-md transition-colors">Save Preferences</button>
      </div>
    </form>
  );
};

const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void; }) => (
  <label className="flex items-center">
    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={checked} onChange={onChange} />
    <span className="ml-2 text-sm text-gray-700">{label}</span>
  </label>
);

export default JobAlertsManager;
