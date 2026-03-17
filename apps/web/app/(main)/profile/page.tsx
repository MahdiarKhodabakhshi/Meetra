'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { TagList } from '@/app/components/ui/tag-list';
import {
  uploadResume,
  getResumeStatus,
  getLatestResume,
  pollResumeUntilDone,
  isAllowedFile,
  resumeErrorCodeMessage,
  POLL_INTERVAL_MS,
} from '@/lib/resumes-api';
import { getMyProfile, updateMyProfile } from '@/lib/profiles-api';
import { getApiErrorMessage } from '@/lib/api-client';
import type {
  ResumeVersionStatus,
  ResumeStatusOut,
  ProfileOut,
  ConfidenceJson,
} from '@/lib/types';

const RESUME_STATUS_STEPS: Record<ResumeVersionStatus, string> = {
  UPLOADED: 'Queued',
  SCANNING: 'Security scan',
  PARSING: 'Extracting',
  PARSED: 'Done',
  FAILED: 'Failed',
};

function ProvenanceBadge({
  confidence,
  field,
}: {
  confidence: ConfidenceJson;
  field: string;
}) {
  const manual = confidence?.manual_overrides?.includes(field);
  const fieldMeta = confidence?.[field];
  const source =
    typeof fieldMeta === 'object' && fieldMeta && 'source' in fieldMeta
      ? String((fieldMeta as { source?: string }).source)
      : null;
  const value =
    typeof fieldMeta === 'object' && fieldMeta && 'value' in fieldMeta
      ? Number((fieldMeta as { value?: number }).value)
      : null;

  if (manual || source === 'USER_CONFIRMED') {
    return (
      <span className="text-xs text-[var(--success)] font-medium" title="You edited this">
        Confirmed
      </span>
    );
  }
  if (source && value != null) {
    return (
      <span className="text-xs text-[var(--muted)]" title={`From resume (confidence ${Math.round(value * 100)}%)`}>
        From resume
      </span>
    );
  }
  return null;
}

export default function ProfilePage() {
  const { user, accessToken } = useAuth();
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);

  const [latestResume, setLatestResume] = useState<
    Awaited<ReturnType<typeof getLatestResume>>['data'] | null
  >(null);
  const [latestResumeLoading, setLatestResumeLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<ResumeStatusOut | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    setProfileLoading(true);
    setProfileError(null);
    const { data, error } = await getMyProfile(accessToken);
    setProfileLoading(false);
    if (error) {
      setProfileError(getApiErrorMessage({ detail: error.detail, statusCode: error.statusCode }));
      return;
    }
    if (data) {
      setProfile(data);
      setHeadline(data.headline ?? '');
      setSummary(data.summary ?? '');
      setSkills(data.skills ?? []);
      setTitles(data.titles ?? []);
      setIndustries(data.industries ?? []);
    }
  }, [accessToken]);

  const loadLatestResume = useCallback(async () => {
    if (!accessToken) return;
    setLatestResumeLoading(true);
    const { data } = await getLatestResume(accessToken);
    setLatestResumeLoading(false);
    setLatestResume(data ?? null);
  }, [accessToken]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadLatestResume();
  }, [loadLatestResume]);

  const saveProfile = async () => {
    if (!accessToken || !profile) return;
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaveSuccess(false);
    const payload: Parameters<typeof updateMyProfile>[1] = {};
    if ((headline.trim() || '') !== (profile.headline ?? '')) {
      payload.headline = headline.trim() || null;
    }
    if ((summary.trim() || '') !== (profile.summary ?? '')) {
      payload.summary = summary.trim() || null;
    }
    if (JSON.stringify(skills) !== JSON.stringify(profile.skills ?? [])) {
      payload.skills = skills;
    }
    if (JSON.stringify(titles) !== JSON.stringify(profile.titles ?? [])) {
      payload.titles = titles;
    }
    if (JSON.stringify(industries) !== JSON.stringify(profile.industries ?? [])) {
      payload.industries = industries;
    }
    if (Object.keys(payload).length === 0) {
      setProfileSaving(false);
      return;
    }
    const { data, error } = await updateMyProfile(accessToken, payload);
    setProfileSaving(false);
    if (error) {
      setProfileError(getApiErrorMessage({ detail: error.detail, statusCode: error.statusCode }));
      return;
    }
    if (data) {
      setProfile(data);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
      loadLatestResume();
    }
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!accessToken || uploading) return;
      const allowed = isAllowedFile(file);
      if (!allowed.ok) {
        setUploadError(allowed.reason);
        return;
      }
      setUploadError(null);
      setUploading(true);
      setPollingStatus(null);
      const { data, error } = await uploadResume(accessToken, file);
      if (error) {
        setUploading(false);
        const code = typeof error.detail === 'object' && error.detail && 'code' in error.detail
          ? String((error.detail as { code?: string }).code)
          : null;
        setUploadError(resumeErrorCodeMessage(code, getApiErrorMessage({ detail: error.detail, statusCode: error.statusCode })));
        return;
      }
      if (!data) {
        setUploading(false);
        setUploadError('Upload did not return a resume.');
        return;
      }
      setPollingStatus({
        id: data.id,
        status: data.status,
        error_code: data.error_code,
        error_message: data.error_message,
        parsed_at: data.parsed_at,
        progress_stage: data.status.toLowerCase(),
      });
      try {
        const final = await pollResumeUntilDone(accessToken, data.id, (s) => {
          setPollingStatus(s);
        });
        if (final.status === 'PARSED') {
          setUploadError(null);
          loadProfile();
          loadLatestResume();
        } else {
          setUploadError(
            resumeErrorCodeMessage(
              final.error_code,
              final.error_message || 'Processing failed.',
            ),
          );
        }
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : 'Status check failed.');
      } finally {
        setUploading(false);
        setPollingStatus(null);
      }
    },
    [accessToken, uploading, loadProfile, loadLatestResume],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Profile</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage your resume, profile fields, and matching data.
        </p>
      </div>

      {/* Account (email / name) */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your email is used to sign in.</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <Input label="Email" value={user?.email ?? ''} disabled />
        </div>
      </Card>

      {/* Resume upload */}
      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
          <CardDescription>
            Upload a PDF or DOCX (max 10 MB). We scan for security, extract text, and parse your
            profile. You can re-upload anytime; your last successful parse stays active if a new one
            fails.
          </CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-[var(--accent)] bg-[var(--muted-bg)]' : 'border-[var(--border)]'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              id="resume-upload"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
                e.target.value = '';
              }}
              disabled={uploading}
            />
            <label htmlFor="resume-upload" className="cursor-pointer block">
              <p className="text-sm text-[var(--muted)] mb-2">
                Drag and drop your resume here, or click to browse.
              </p>
              <span className="btn btn-secondary inline-flex">
                {uploading ? 'Processing…' : 'Choose file'}
              </span>
            </label>
          </div>

          {pollingStatus && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[var(--muted)]">Status:</span>
              <span
                className={`badge ${
                  pollingStatus.status === 'PARSED'
                    ? 'badge-published'
                    : pollingStatus.status === 'FAILED'
                      ? 'badge-cancelled'
                      : 'badge-waitlisted'
                }`}
              >
                {RESUME_STATUS_STEPS[pollingStatus.status]}
              </span>
              {pollingStatus.status === 'UPLOADED' && <span className="text-sm text-[var(--muted)]">Queued…</span>}
              {pollingStatus.status === 'SCANNING' && <span className="text-sm text-[var(--muted)]">Scanning…</span>}
              {pollingStatus.status === 'PARSING' && <span className="text-sm text-[var(--muted)]">Extracting…</span>}
              {pollingStatus.status === 'PARSED' && (
                <span className="text-sm text-[var(--success)]">Ready for matching.</span>
              )}
              {pollingStatus.status === 'FAILED' && (
                <span className="text-sm text-[var(--destructive)]">
                  {resumeErrorCodeMessage(pollingStatus.error_code, pollingStatus.error_message || 'Failed.')}
                </span>
              )}
            </div>
          )}

          {uploadError && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-[var(--destructive)]" role="alert">
                {uploadError}
              </p>
              <Button variant="secondary" size="sm" onClick={() => setUploadError(null)}>
                Dismiss
              </Button>
              {uploadError.includes('try again') || uploadError.includes('Try again') ? (
                <Button variant="primary" size="sm" onClick={() => setUploadError(null)}>
                  Try again
                </Button>
              ) : null}
            </div>
          )}

          <p className="text-xs text-[var(--muted)]">
            Pipeline: Upload → Security scan → Text extraction → Field extraction. Polling every{' '}
            {POLL_INTERVAL_MS / 1000}s until done.
          </p>
        </div>
      </Card>

      {/* View last resume parse job */}
      <Card>
        <CardHeader>
          <CardTitle>Last resume</CardTitle>
          <CardDescription>
            Most recent resume version and parse status.
          </CardDescription>
        </CardHeader>
        {latestResumeLoading ? (
          <p className="text-sm text-[var(--muted)]">Loading…</p>
        ) : latestResume ? (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-[var(--muted)]">File:</span>{' '}
              {latestResume.original_filename}
            </p>
            <p>
              <span className="text-[var(--muted)]">Status:</span>{' '}
              <span
                className={
                  latestResume.status === 'PARSED'
                    ? 'text-[var(--success)]'
                    : latestResume.status === 'FAILED'
                      ? 'text-[var(--destructive)]'
                      : 'text-[var(--muted)]'
                }
              >
                {RESUME_STATUS_STEPS[latestResume.status]}
              </span>
            </p>
            {latestResume.status === 'FAILED' && latestResume.error_code && (
              <p className="text-[var(--destructive)]">
                {resumeErrorCodeMessage(latestResume.error_code, latestResume.error_message || '')}
              </p>
            )}
            <p className="text-[var(--muted)]">
              Uploaded {new Date(latestResume.created_at).toLocaleString()}
              {latestResume.parsed_at &&
                ` · Parsed ${new Date(latestResume.parsed_at).toLocaleString()}`}
            </p>
            <Button variant="secondary" size="sm" onClick={() => document.getElementById('resume-upload')?.click()}>
              Re-upload & re-parse
            </Button>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No resume uploaded yet.</p>
        )}
      </Card>

      {/* Profile fields */}
      <Card>
        <CardHeader>
          <CardTitle>Profile fields</CardTitle>
          <CardDescription>
            Edit headline, summary, skills, titles, and industries. Manual edits are kept when we
            re-parse your resume. Last updated and source resume are shown below.
          </CardDescription>
        </CardHeader>
        {profileLoading ? (
          <p className="text-sm text-[var(--muted)]">Loading profile…</p>
        ) : (
          <div className="space-y-6">
            {profileError && (
              <p className="text-sm text-[var(--destructive)]" role="alert">
                {profileError}
              </p>
            )}
            {profile && (
              <>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                  <span>Last updated: {new Date(profile.updated_at).toLocaleString()}</span>
                  {profile.source_resume_id && (
                    <span>· Source resume: {profile.source_resume_id.slice(0, 8)}…</span>
                  )}
                </div>
                <div className="grid gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="text-sm font-medium text-[var(--foreground)]">Headline</label>
                      <ProvenanceBadge confidence={profile.confidence_json} field="headline" />
                    </div>
                    <Input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="text-sm font-medium text-[var(--foreground)]">Summary</label>
                      <ProvenanceBadge confidence={profile.confidence_json} field="summary" />
                    </div>
                    <textarea
                      className="input-base min-h-[100px]"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Short professional summary"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--foreground)]">Skills</span>
                      <ProvenanceBadge confidence={profile.confidence_json} field="skills" />
                    </div>
                    <TagList
                      values={skills}
                      onChange={setSkills}
                      placeholder="Add a skill…"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--foreground)]">Job titles</span>
                      <ProvenanceBadge confidence={profile.confidence_json} field="titles" />
                    </div>
                    <TagList
                      values={titles}
                      onChange={setTitles}
                      placeholder="Add a title…"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--foreground)]">Industries</span>
                      <ProvenanceBadge confidence={profile.confidence_json} field="industries" />
                    </div>
                    <TagList
                      values={industries}
                      onChange={setIndustries}
                      placeholder="Add an industry…"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={saveProfile} loading={profileSaving}>
                    {profileSaveSuccess ? 'Saved' : 'Save profile'}
                  </Button>
                  {profileSaveSuccess && (
                    <span className="text-sm text-[var(--success)]">Changes saved.</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
